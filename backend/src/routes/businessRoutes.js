import express from "express";
import {
  getBusinesses,
  getBusiness,
  createBusiness,
  updateBusiness,
  updateBusinessReferralCode,
} from "../controllers/businessController.js";
import { getPointsDashboard, withdrawPoints } from "../controllers/pointsController.js";
import { protect, checkBusinessOwnership } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getBusinesses);
router.get("/:id", getBusiness);
router.post("/", createBusiness);
router.put("/:id", protect, checkBusinessOwnership, updateBusiness);
router.patch("/:id/referral-code", protect, checkBusinessOwnership, updateBusinessReferralCode);

router.get("/:id/points", protect, checkBusinessOwnership, getPointsDashboard);
router.post("/:id/points/withdraw", protect, checkBusinessOwnership, withdrawPoints);

export default router;
