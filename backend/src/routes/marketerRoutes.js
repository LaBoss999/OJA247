import express from "express";
import {
  registerMarketer,
  loginMarketer,
  getMarketerMe,
  forgotMarketerPassword,
  resetMarketerPassword,
} from "../controllers/marketerAuthController.js";
import {
  getMarketerDashboard,
  updateMarketerPayoutDetails,
  requestMarketerWithdrawal,
  updateMarketerReferralCode,
} from "../controllers/marketerController.js";
import { protectMarketer } from "../middleware/marketerAuthMiddleware.js";

const router = express.Router();

router.post("/register", registerMarketer);
router.post("/login", loginMarketer);
router.post("/forgot-password", forgotMarketerPassword);
router.post("/reset-password", resetMarketerPassword);
router.get("/me", protectMarketer, getMarketerMe);
router.get("/dashboard", protectMarketer, getMarketerDashboard);
router.patch("/me/payout-details", protectMarketer, updateMarketerPayoutDetails);
router.post("/withdraw", protectMarketer, requestMarketerWithdrawal);
router.patch("/me/referral-code", protectMarketer, updateMarketerReferralCode);

export default router;