import express from "express";
import { getBusinesses, getBusinessById, createBusiness } from "../controllers/businessController.js";

const router = express.Router();

router.get("/", getBusinesses);
router.get("/:id", getBusinessById);
router.post("/", createBusiness);

export default router;
