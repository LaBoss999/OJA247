import Order from "../models/Order.js";
import Dispute, { DISPUTE_WINDOW_DAYS, SELF_RESOLVE_WINDOW_DAYS } from "../models/Dispute.js";
import User from "../models/User.js";
import {
  sendDisputeFiledVendorEmail,
  sendDisputeFiledCustomerEmail,
  sendDisputeResolvedCustomerEmail,
} from "../services/emailService.js";

export async function getOwnerEmail(businessId) {
  const owner = await User.findOne({ businessId }).select("email");
  return owner?.email || null;
}

// POST /api/disputes
// Public — no customer account system exists yet, so this is guest-filed,
// verified the same way lookupOrderForDispute is: reference + matching
// email on the order, not a login token.
//
// body: { orderReference, email, businessId, itemIds?, reason, description, evidence? }
// businessId is required even though it's implied by the order, because a
// single order can span multiple vendors (see Order.vendors) — the
// customer has to say which vendor's item(s) this is actually about.
export const fileDispute = async (req, res) => {
  try {
    const { orderReference, email, businessId, itemIds, reason, description, evidence } = req.body;

    if (!orderReference || !email || !businessId || !reason || !description) {
      return res.status(400).json({
        message: "orderReference, email, businessId, reason, and description are required",
      });
    }

    const order = await Order.findOne({ reference: orderReference });
    if (!order || order.customer?.email?.toLowerCase() !== String(email).toLowerCase()) {
      return res.status(404).json({ message: "No matching order found" });
    }

    // Only paid orders can be disputed — nothing to dispute on an order
    // that never went through, and re-disputing an already-disputed order
    // should happen through the existing dispute, not a second one.
    if (order.status !== "paid") {
      return res.status(400).json({
        message: `This order can't be disputed (status: ${order.status}).`,
      });
    }

    const windowEnd = new Date(order.createdAt.getTime() + DISPUTE_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    if (new Date() > windowEnd) {
      return res.status(400).json({
        message: `The ${DISPUTE_WINDOW_DAYS}-day window to dispute this order has passed.`,
      });
    }

    const vendorOnOrder = order.vendors.find((v) => v.businessId === businessId);
    if (!vendorOnOrder) {
      return res.status(400).json({ message: "That business wasn't part of this order" });
    }

    // If specific items were named, every one of them has to actually
    // belong to this vendor on this order — otherwise a customer could
    // (accidentally or not) dispute another vendor's item under this one's
    // businessId.
    if (Array.isArray(itemIds) && itemIds.length > 0) {
      const validItemIds = new Set(
        order.items.filter((i) => i.businessId === businessId).map((i) => i.productId)
      );
      const invalid = itemIds.filter((id) => !validItemIds.has(id));
      if (invalid.length > 0) {
        return res.status(400).json({ message: "One or more itemIds don't belong to this order/vendor" });
      }
    }

    const dispute = await Dispute.create({
      orderId: order._id,
      orderReference: order.reference,
      businessId,
      businessName: vendorOnOrder.businessName || "",
      itemIds: Array.isArray(itemIds) ? itemIds : [],
      customer: {
        fullName: order.customer.fullName,
        email: order.customer.email,
        phone: order.customer.phone,
      },
      reason,
      description,
      evidence: Array.isArray(evidence)
        ? evidence.map((url) => ({ url, uploadedBy: "customer" }))
        : [],
    });

    // Order-level status only flips to "disputed" if it isn't already in
    // some other terminal state — a second dispute on an already-disputed
    // order (different item, say) shouldn't fight over the flag.
    if (order.status === "paid") {
      order.status = "disputed";
      await order.save();
    }

    // Notifications — fire-and-forget, matches the rest of the codebase's
    // pattern (a broken mail server shouldn't fail the dispute filing).
    const vendorEmail = await getOwnerEmail(businessId);
    if (vendorEmail) {
      const selfResolveDeadline = new Date(
        dispute.createdAt.getTime() + SELF_RESOLVE_WINDOW_DAYS * 24 * 60 * 60 * 1000
      );
      sendDisputeFiledVendorEmail({
        to: vendorEmail,
        businessName: vendorOnOrder.businessName,
        orderReference: order.reference,
        reason,
        description,
        selfResolveDeadline,
      }).catch((err) => console.error("Dispute-filed vendor email failed:", err));
    }
    sendDisputeFiledCustomerEmail({
      to: order.customer.email,
      customerName: order.customer.fullName,
      businessName: vendorOnOrder.businessName,
      orderReference: order.reference,
    }).catch((err) => console.error("Dispute-filed customer email failed:", err));

    res.status(201).json({ dispute });
  } catch (error) {
    console.error("File dispute error:", error);
    res.status(500).json({ message: "Error filing dispute" });
  }
};

// --- Phase 2: vendor self-resolve ---
// This is meant to be where most disputes end — vendor and customer
// sorting it out directly, same as the plan's original intent. Nothing
// here touches money; "refunded" just records that the vendor says they
// refunded the customer off-platform (see the phased plan doc's note on
// the platform not processing refunds itself).

// GET /api/disputes/business/:businessId
// Vendor's own open disputes. Inline ownership check rather than the
// existing checkBusinessOwnership middleware, since that expects
// req.params.id and this route uses :businessId — not worth a second
// middleware for one param-name difference.
export const getDisputesByBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;

    if (req.user.role !== "admin" && req.user.businessId?.toString() !== businessId) {
      return res.status(403).json({ message: "Not authorized to view these disputes" });
    }

    const disputes = await Dispute.find({ businessId }).sort({ createdAt: -1 });
    res.json({ disputes });
  } catch (error) {
    console.error("Get disputes by business error:", error);
    res.status(500).json({ message: "Error fetching disputes" });
  }
};

// PATCH /api/disputes/:id/resolve
// body: { note, refunded? }
export const vendorResolveDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { note, refunded } = req.body;

    if (!note) {
      return res.status(400).json({ message: "note is required" });
    }

    const dispute = await Dispute.findById(id);
    if (!dispute) {
      return res.status(404).json({ message: "Dispute not found" });
    }

    if (req.user.role !== "admin" && req.user.businessId?.toString() !== dispute.businessId) {
      return res.status(403).json({ message: "Not authorized to resolve this dispute" });
    }

    // Only "open" disputes are the vendor's to resolve — once it's
    // auto-escalated (Phase 3's cron), it's out of their hands; they can
    // still be part of the conversation, but the record-keeping status
    // moves to admin from there.
    if (dispute.status !== "open") {
      return res.status(400).json({
        message: `This dispute is already ${dispute.status} and can no longer be resolved from here.`,
      });
    }

    dispute.status = "resolved";
    dispute.vendorResponse = { note, respondedAt: new Date() };
    await dispute.save();

    const order = await Order.findById(dispute.orderId);
    if (order && order.status === "disputed") {
      // Refunded off-platform -> record it; otherwise the dispute's
      // resolved but the money never moved, so the order just goes back
      // to reflecting a normal paid order.
      order.status = refunded ? "refunded" : "paid";
      await order.save();
    }

    sendDisputeResolvedCustomerEmail({
      to: dispute.customer.email,
      customerName: dispute.customer.fullName,
      businessName: dispute.businessName,
      orderReference: dispute.orderReference,
      refunded: Boolean(refunded),
    }).catch((err) => console.error("Dispute-resolved customer email failed:", err));

    res.json({ dispute });
  } catch (error) {
    console.error("Vendor resolve dispute error:", error);
    res.status(500).json({ message: "Error resolving dispute" });
  }
};