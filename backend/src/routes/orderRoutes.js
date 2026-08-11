import express from "express";
import {
  createOrder,
  getOrderByReference,
  updateOrderStatus,
  verifyOrderPayment,
  getOrdersByBusiness,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createOrder);
router.post("/verify/:reference", verifyOrderPayment);
router.get("/reference/:reference", getOrderByReference);
router.patch("/reference/:reference", updateOrderStatus);

// Vendor's own orders — requires a valid logged-in user (any authenticated
// vendor can currently query any businessId; add an ownership check here
// later the same way checkBusinessOwnership works for /api/businesses if
// you want to lock this down to only the business's own owner).
router.get("/business/:businessId", protect, getOrdersByBusiness);

export default router;