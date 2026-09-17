import express from "express";
import {
  register,
  login,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword,
  totpSetupInit,
  totpSetupVerify,
  totpVerifyLogin,
} from "../controllers/authController.js";
import { protect, requireTotpPendingToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// TOTP steps — use the short-lived pre-auth token issued by /login, not a
// normal session token (see requireTotpPendingToken).
router.post("/totp/setup-init", requireTotpPendingToken, totpSetupInit);
router.post("/totp/setup-verify", requireTotpPendingToken, totpSetupVerify);
router.post("/totp/verify", requireTotpPendingToken, totpVerifyLogin);

// Protected routes (require authentication)
router.get("/me", protect, getMe);
router.put("/password", protect, updatePassword);

export default router;