import express from "express";
import { getBusinesses, getBusiness, createBusiness } from "../controllers/businessController.js";

const router = express.Router();

router.get("/", getBusinesses);
router.get("/:id", getBusiness);
router.post("/", createBusiness);

export default router;
