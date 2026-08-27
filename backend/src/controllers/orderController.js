import Order from "../models/Order.js";
import Vendor from "../models/Vendor.js";

// Looks up each vendor's Paystack subaccount and builds the dynamic "flat"
// split payload (Paystack keeps whatever isn't allocated to a subaccount,
// so the platform's service fee + VAT naturally stay on the main account).
async function buildPaystackSplit(orderVendors) {
  const businessIds = orderVendors.map((v) => v.businessId).filter(Boolean);
  const vendorRecords = await Vendor.find({ businessId: { $in: businessIds } });
  const vendorByBusinessId = new Map(vendorRecords.map((v) => [v.businessId.toString(), v]));

  const subaccounts = [];
  const missing = [];

  orderVendors.forEach((v) => {
    const vendor = v.businessId && vendorByBusinessId.get(v.businessId.toString());
    if (!vendor?.subaccountCode) {
      missing.push(v.businessName || "Unknown vendor");
      return;
    }

    const share = Math.round((v.itemsSubtotal + v.deliveryFee) * 100); // kobo
    if (share > 0) {
      subaccounts.push({ subaccount: vendor.subaccountCode, share });
    }
  });

  return { subaccounts, missing };
}

export const createOrder = async (req, res) => {
  try {
    const {
      reference,
      customer,
      items,
      subtotal,
      serviceFee,
      vat,
      deliveryFee,
      deliveryBreakdown,
      total,
      deliveryMethod,
    } = req.body;

    if (!reference || !customer || !items || items.length === 0) {
      return res.status(400).json({ message: "Missing required order fields" });
    }

    const existingOrder = await Order.findOne({ reference });
    if (existingOrder) {
      const { subaccounts, missing } = await buildPaystackSplit(existingOrder.vendors);
      if (missing.length > 0) {
        return res.status(400).json({
          message: `Some vendors in this order haven't finished payout setup yet: ${missing.join(
            ", "
          )}. Remove their items and try again.`,
        });
      }

      return res.status(200).json({
        message: "Order already exists",
        order: existingOrder,
        split: { type: "flat", bearer_type: "account", subaccounts },
      });
    }

    // Build the per-vendor breakdown the Order model expects (vendors[]),
    // from what Checkout.jsx sends as deliveryBreakdown ([{businessId, businessName, fee}]).
    // itemsSubtotal is derived here since the frontend doesn't currently send it per vendor.
    const vendors = Array.isArray(deliveryBreakdown)
      ? deliveryBreakdown.map((v) => {
          const vendorItemsSubtotal = (items || [])
            .filter((item) => (item.businessId || null) === (v.businessId || null))
            .reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

          return {
            businessId: v.businessId || null,
            businessName: v.businessName || "",
            itemsSubtotal: vendorItemsSubtotal,
            deliveryFee: Number(v.fee || 0),
          };
        })
      : [];

    // Every vendor in the cart must have a working payout subaccount before
    // we accept payment — otherwise their share of the money has nowhere to
    // automatically go.
    const { subaccounts, missing } = await buildPaystackSplit(vendors);
    if (missing.length > 0) {
      return res.status(400).json({
        message: `Some vendors in your cart haven't finished payout setup yet: ${missing.join(
          ", "
        )}. Remove their items to continue.`,
      });
    }

    const order = await Order.create({
      reference,
      customer,
      items,
      vendors,
      subtotal,
      serviceFee: serviceFee || 0,
      vat: vat || 0,
      deliveryFee,
      total,
      deliveryMethod,
      status: "pending",
      paymentStatus: "pending",
    });

    res.status(201).json({
      message: "Order created",
      order,
      split: { type: "flat", bearer_type: "account", subaccounts },
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Error creating order" });
  }
};

export const verifyOrderPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({ message: "Payment reference is required" });
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      return res.status(500).json({
        message: "Paystack secret key is not configured on the backend",
      });
    }

    const verificationResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const verificationData = await verificationResponse.json();

    const order = await Order.findOne({ reference });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!verificationResponse.ok || !verificationData.status || verificationData.data?.status !== "success") {
      const failedOrder = await Order.findOneAndUpdate(
        { reference },
        { status: "failed", paymentStatus: "failed" },
        { new: true }
      );

      return res.status(400).json({
        message: "Payment verification failed",
        order: failedOrder,
        verification: verificationData,
      });
    }

    const paidOrder = await Order.findOneAndUpdate(
      { reference },
      { status: "paid", paymentStatus: "paid" },
      { new: true }
    );

    return res.json({
      message: "Payment verified successfully",
      order: paidOrder,
      verification: verificationData,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({ message: "Error verifying payment" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { reference } = req.params;
    const { status, paymentStatus } = req.body;

    const order = await Order.findOneAndUpdate(
      { reference },
      {
        status: status || "pending",
        paymentStatus: paymentStatus || status || "pending",
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order status updated", order });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Error updating order" });
  }
};

export const getOrderByReference = async (req, res) => {
  try {
    const { reference } = req.params;
    const order = await Order.findOne({ reference });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Error fetching order" });
  }
};

// Orders containing at least one item belonging to this business.
// Used by the vendor's Orders tab in BusinessDashboard.jsx.
export const getOrdersByBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;

    if (!businessId) {
      return res.status(400).json({ message: "businessId is required" });
    }

    const orders = await Order.find({ "items.businessId": businessId }).sort({
      createdAt: -1,
    });

    res.json(orders);
  } catch (error) {
    console.error("Get orders by business error:", error);
    res.status(500).json({ message: "Error fetching business orders" });
  }
};