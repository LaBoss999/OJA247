import express from "express";
import {
  customerRegister,
  customerLogin,
  customerGoogleAuth,
  customerForgotPassword,
  customerResetPassword,
  getCustomerMe,
} from "../controllers/customerAuthController.js";
import { protect, requireCustomer } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", customerRegister);
router.post("/login", customerLogin);
router.post("/google", customerGoogleAuth);
router.post("/forgot-password", customerForgotPassword);
router.post("/reset-password", customerResetPassword);

router.get("/me", protect, requireCustomer, getCustomerMe);

// Order history (Phase 2), follow (Phase 4), and reviews (Phase 5)
// endpoints land here next.

export default router;