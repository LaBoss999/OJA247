import Order from "../models/Order.js";

export const createOrder = async (req, res) => {
  try {
    const {
      reference,
      customer,
      items,
      subtotal,
      deliveryFee,
      total,
      deliveryMethod,
    } = req.body;

    if (!reference || !customer || !items || items.length === 0) {
      return res.status(400).json({ message: "Missing required order fields" });
    }

    const existingOrder = await Order.findOne({ reference });
    if (existingOrder) {
      return res.status(200).json({
        message: "Order already exists",
        order: existingOrder,
      });
    }

    const order = await Order.create({
      reference,
      customer,
      items,
      subtotal,
      deliveryFee,
      total,
      deliveryMethod,
      status: "pending",
      paymentStatus: "pending",
    });

    res.status(201).json({ message: "Order created", order });
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
