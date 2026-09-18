import express from "express";
import {
  createOrder,
  getOrderByReference,
  lookupOrderForDispute,
  updateOrderStatus,
  verifyOrderPayment,
  getOrdersByBusiness,
  handlePaystackWebhook,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createOrder);
router.post("/verify/:reference", verifyOrderPayment);
// Public — Paystack calls this directly, verified via signature, not a user token
router.post("/webhook", handlePaystackWebhook);
router.get("/reference/:reference", getOrderByReference);
// Email-verified lookup — see lookupOrderForDispute's comment for why this
// is separate from the bare-reference endpoint above.
router.get("/lookup", lookupOrderForDispute);
router.patch("/reference/:reference", updateOrderStatus);

// Vendor's own orders — requires a valid logged-in user (any authenticated
// vendor can currently query any businessId; add an ownership check here
// later the same way checkBusinessOwnership works for /api/businesses if
// you want to lock this down to only the business's own owner).
router.get("/business/:businessId", protect, getOrdersByBusiness);

export default router;