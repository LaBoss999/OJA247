import express from "express";
import {
  createOrder,
  getOrderByReference,
  lookupOrderForDispute,
  verifyOrderPayment,
  getOrdersByBusiness,
  getMyOrders,
  handlePaystackWebhook,
} from "../controllers/orderController.js";
import { protect, requireCustomer } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createOrder);
router.post("/verify/:reference", verifyOrderPayment);
// Public — Paystack calls this directly, verified via signature, not a user token
router.post("/webhook", handlePaystackWebhook);
router.get("/reference/:reference", getOrderByReference);
// Email-verified lookup — see lookupOrderForDispute's comment for why this
// is separate from the bare-reference endpoint above.
router.get("/lookup", lookupOrderForDispute);
// SECURITY: there used to be an unauthenticated
// `router.patch("/reference/:reference", updateOrderStatus)` here — no
// auth, no ownership check, client-controlled paymentStatus. Anyone could
// mark any order "paid" without ever touching Paystack. Removed entirely
// rather than gated, since real status changes should only ever come from
// the signature-verified webhook above or verifyOrderPayment — nothing
// else should be trusted to set payment status. Confirmed the frontend
// never called this route before removing it.

// Customer's own order history — scoped to req.user._id server-side (see
// getMyOrders), so there's no id param a customer could tamper with to see
// someone else's orders the way there theoretically could be below.
router.get("/my-orders", protect, requireCustomer, getMyOrders);

// Vendor's own orders — protect + ownership check inside getOrdersByBusiness
// (see its comment) locks this to the business's own owner or an admin.
router.get("/business/:businessId", protect, getOrdersByBusiness);

export default router;