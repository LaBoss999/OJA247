import express from "express";
import {
  registerMarketer,
  loginMarketer,
  getMarketerMe,
} from "../controllers/marketerAuthController.js";
import { getMarketerDashboard, updateMarketerPayoutDetails } from "../controllers/marketerController.js";
import { protectMarketer } from "../middleware/marketerAuthMiddleware.js";

const router = express.Router();

router.post("/register", registerMarketer);
router.post("/login", loginMarketer);
router.get("/me", protectMarketer, getMarketerMe);
router.get("/dashboard", protectMarketer, getMarketerDashboard);
router.patch("/me/payout-details", protectMarketer, updateMarketerPayoutDetails);

export default router;
