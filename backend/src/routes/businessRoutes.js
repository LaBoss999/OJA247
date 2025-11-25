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

// GET single business
router.get("/:id", async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    res.json(business);
  } catch (error) {
    res.status(500).json({ message: "Error fetching business" });
  }
});

export default router;
