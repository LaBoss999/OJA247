import express from "express";
import Business from "../models/Business.js";

const router = express.Router();

// Create a business
router.post("/", async (req, res) => {
  try {
    const business = new Business(req.body);
    await business.save();
    res.status(201).json(business);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating business" });
  }
});

// Get all businesses
router.get("/", async (req, res) => {
  try {
    const businesses = await Business.find();
    res.json(businesses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching businesses" });
  }
});

export default router;
