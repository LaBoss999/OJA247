import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";
import {
  getAllUsers,
  getStats,
  toggleFeatured,
  deleteBusiness,
  toggleUserBan
} from "../controllers/adminController.js";

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(requireAdmin);

// Admin routes
router.get("/users", getAllUsers);
router.get("/stats", getStats);
router.patch("/businesses/:id/featured", toggleFeatured);
router.delete("/businesses/:id", deleteBusiness);
router.patch("/users/:id/ban", toggleUserBan);

export default router;