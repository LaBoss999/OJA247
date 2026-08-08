import express from "express";
import {
  getBusinesses,
  getBusiness,
  createBusiness,
  updateBusiness,
} from "../controllers/businessController.js";
import { protect, checkBusinessOwnership } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getBusinesses);
router.get("/:id", getBusiness);
router.post("/", createBusiness);
router.put("/:id", protect, checkBusinessOwnership, updateBusiness);

export default router;
