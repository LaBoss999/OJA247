import express from "express";
import {
  createOrder,
  getOrderByReference,
  updateOrderStatus,
  verifyOrderPayment,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", createOrder);
router.post("/verify/:reference", verifyOrderPayment);
router.get("/reference/:reference", getOrderByReference);
router.patch("/reference/:reference", updateOrderStatus);

export default router;
