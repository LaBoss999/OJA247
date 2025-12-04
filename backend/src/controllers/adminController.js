import User from "../models/User.js";
import Business from "../models/Business.js";
import Product from "../models/Product.js";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("businessId", "name category")
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get platform statistics
export const getStats = async (req, res) => {
  try {
    const [
      totalBusinesses,
      totalProducts,
      totalUsers,
      businessesByCategory
    ] = await Promise.all([
      Business.countDocuments(),
      Product.countDocuments(),
      User.countDocuments(),
      Business.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      totalBusinesses,
      totalProducts,
      totalUsers,
      businessesByCategory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle featured status
export const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;

    const business = await Business.findByIdAndUpdate(
      id,
      { featured },
      { new: true }
    );

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    res.json(business);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete any business (admin only)
export const deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete all products for this business
    await Product.deleteMany({ businessId: id });

    // Delete the business
    const business = await Business.findByIdAndDelete(id);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Delete the user account
    await User.findOneAndDelete({ businessId: id });

    res.json({ message: "Business and related data deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ban/unban a user
export const toggleUserBan = async (req, res) => {
  try {
    const { id } = req.params;
    const { banned } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { banned },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};