import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";
import {
  getAllUsers,
  getStats,
  getAllOrders,
  toggleFeatured,
  deleteBusiness,
  toggleUserBan,
  getAllVendors,
  reviewVendor,
  setVerificationDeadline,
} from "../controllers/adminController.js";
import { getPayoutBatches, markPayoutBatchPaid } from "../controllers/payoutBatchController.js";

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(requireAdmin);

// Admin routes
router.get("/users", getAllUsers);
router.get("/stats", getStats);
router.get("/orders", getAllOrders);
router.patch("/businesses/:id/featured", toggleFeatured);
router.delete("/businesses/:id", deleteBusiness);
router.patch("/users/:id/ban", toggleUserBan);
router.get("/vendors", getAllVendors);
router.patch("/vendors/:id/review", reviewVendor);
router.patch("/businesses/:id/verification-deadline", setVerificationDeadline);

// Marketer payout batches (weekly, frozen by the cron job — see cronRoutes.js)
router.get("/payout-batches", getPayoutBatches);
router.post("/payout-batches/:marketerId/mark-paid", markPayoutBatchPaid);

export default router;
