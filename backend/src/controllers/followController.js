import mongoose from "mongoose";
import Follow from "../models/Follow.js";
import Business from "../models/Business.js";

// GET /api/follows/status/:businessId
// Only meaningful for a logged-in customer — the frontend only calls this
// when isAuthenticated && isCustomer, so there's no "logged out" case to
// handle here (requireCustomer on the route already guarantees req.user
// exists and is a customer).
export const getFollowStatus = async (req, res) => {
  try {
    const { businessId } = req.params;
    const isFollowing = await Follow.exists({ customerId: req.user._id, businessId });
    res.json({ isFollowing: Boolean(isFollowing) });
  } catch (error) {
    console.error("Get follow status error:", error);
    res.status(500).json({ message: "Error checking follow status" });
  }
};

// POST /api/follows/:businessId
export const followBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({ message: "Invalid business id" });
    }
    const business = await Business.findById(businessId).select("_id");
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    try {
      await Follow.create({ customerId: req.user._id, businessId });
    } catch (error) {
      // Duplicate key = already following — treat as success rather than
      // an error, since the end state the caller wanted (following) is
      // already true. A double-click or a stale UI retry shouldn't surface
      // as a failure.
      if (error.code !== 11000) throw error;
    }

    const followerCount = await Follow.countDocuments({ businessId });
    res.json({ following: true, followerCount });
  } catch (error) {
    console.error("Follow business error:", error);
    res.status(500).json({ message: "Error following business" });
  }
};

// DELETE /api/follows/:businessId
export const unfollowBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    await Follow.deleteOne({ customerId: req.user._id, businessId });
    const followerCount = await Follow.countDocuments({ businessId });
    res.json({ following: false, followerCount });
  } catch (error) {
    console.error("Unfollow business error:", error);
    res.status(500).json({ message: "Error unfollowing business" });
  }
};
