import express from "express";
import { register, login, getMe, updatePassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes (require authentication)
router.get("/me", protect, getMe);
router.put("/password", protect, updatePassword);

export default router;