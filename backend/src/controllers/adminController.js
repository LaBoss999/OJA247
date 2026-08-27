import User from "../models/User.js";
import Business from "../models/Business.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Vendor from "../models/Vendor.js";

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
      totalOrders,
      totalRevenue,
      businessesByCategory,
    ] = await Promise.all([
      Business.countDocuments(),
      Product.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Business.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const revenue = totalRevenue[0]?.total || 0;

    res.json({
      totalBusinesses,
      totalProducts,
      totalUsers,
      totalOrders,
      totalRevenue: revenue,
      businessesByCategory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
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

// All vendor onboarding submissions, for manual verification review
export const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find()
      .populate("businessId", "name category location")
      .sort({ createdAt: -1 });

    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve or reject a vendor's verification submission
export const reviewVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, notes } = req.body;

    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({ message: "decision must be 'approved' or 'rejected'" });
    }

    const vendor = await Vendor.findByIdAndUpdate(
      id,
      {
        reviewStatus: decision,
        reviewNotes: notes || "",
        reviewedAt: new Date(),
        reviewedBy: req.user._id,
        notificationSeen: false, // vendor sees this next time they check their status
      },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Start, extend, or clear a business's verification countdown.
// deadline: an ISO date string to set it explicitly, or null to stop the
// countdown entirely (business is never auto-hidden while it's null).
export const setVerificationDeadline = async (req, res) => {
  try {
    const { id } = req.params;
    const { deadline } = req.body;

    const business = await Business.findByIdAndUpdate(
      id,
      { verificationDeadline: deadline ? new Date(deadline) : null },
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