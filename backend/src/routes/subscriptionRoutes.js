import express from "express";
import {
  initiateSubscription,
  verifySubscriptionPayment,
  handleSubscriptionWebhook,
} from "../controllers/subscriptionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/initiate", protect, initiateSubscription);
router.post("/verify/:reference", protect, verifySubscriptionPayment);
// Paystack calls this directly — no auth middleware, verified via signature instead
router.post("/webhook", handleSubscriptionWebhook);

export default router;
