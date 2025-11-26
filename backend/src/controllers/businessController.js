import Business from "../models/Business.js";

// GET all
export const getBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find();
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching businesses" });
  }
};

// GET one
export const getBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: "Not found" });
    res.json(business);
  } catch (error) {
    res.status(500).json({ message: "Error fetching business" });
  }
};

// POST new
export const createBusiness = async (req, res) => {
  try {
    const newBusiness = new Business(req.body);
    const saved = await newBusiness.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: "Error creating business" });
  }
};
