import Business from "../models/Business.js";

// GET all
export const getBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find();
    res.json(businesses);
  } catch (error) {
    console.error("Get businesses error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET one
export const getBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: "Not found" });
    res.json(business);
  } catch (error) {
    console.error("Get business error:", error);
    res.status(500).json({ message: error.message });
  }
};

// POST new
export const createBusiness = async (req, res) => {
  try {
    const newBusiness = new Business(req.body);
    const saved = await newBusiness.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Create business error:", error);
    res.status(400).json({ message: error.message });
  }
};

// PUT update
export const updateBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedFields = [
      "name",
      "description",
      "category",
      "location",
      "contact",
      "logo",
      "banner",
      "themeColor",
      "socialLinks",
      "highlights",
      "deliveryFeeInState",
      "deliveryFeeOutState",
    ];

    const sanitizedUpdates = {};
    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        sanitizedUpdates[field] = updates[field];
      }
    });

    const updatedBusiness = await Business.findByIdAndUpdate(
      id,
      sanitizedUpdates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedBusiness) {
      return res.status(404).json({ message: "Business not found" });
    }

    res.json(updatedBusiness);
  } catch (error) {
    console.error("Update business error:", error);
    res.status(400).json({ message: error.message });
  }
};