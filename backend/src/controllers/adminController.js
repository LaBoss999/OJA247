import User from "../models/User.js";
import Business from "../models/Business.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Vendor from "../models/Vendor.js";
import PlatformSettings from "../models/PlatformSettings.js";
import Marketer from "../models/Marketer.js";
import MarketerPayout from "../models/MarketerPayout.js";
import ReferralAttribution from "../models/ReferralAttribution.js";
import SubscriptionPayment from "../models/SubscriptionPayment.js";
import PointsLedger from "../models/PointsLedger.js";
import { sendVerificationReviewedEmail } from "../services/emailService.js";

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
        // Approval is the manual review that a bank-change hold is waiting
        // on — clear it so their subaccount can receive payouts again.
        ...(decision === "approved" ? { payoutHold: false, payoutHoldReason: "" } : {}),
      },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    await sendVerificationReviewedEmail({
      to: vendor.contactEmail,
      businessName: vendor.businessName,
      decision,
      reviewNotes: notes || "",
    });

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
// GET /api/admin/settings
export const getPlatformSettings = async (req, res) => {
  try {
    const settings = await PlatformSettings.getSettings();
    res.json({ enforceSubscriptionVisibility: settings.enforceSubscriptionVisibility });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/admin/settings/subscription-visibility
// Admin kill switch (see PlatformSettings.js + businessController.getBusinesses).
// Turning this ON hides any business without a currently active subscription
// from public listings — only flip it on once vendors have had a fair
// chance to actually pay via the new subscription system.
export const setSubscriptionVisibilityEnforcement = async (req, res) => {
  try {
    const { enabled } = req.body;
    if (typeof enabled !== "boolean") {
      return res.status(400).json({ message: "'enabled' must be true or false" });
    }

    const settings = await PlatformSettings.getSettings();
    settings.enforceSubscriptionVisibility = enabled;
    await settings.save();

    res.json({ enforceSubscriptionVisibility: settings.enforceSubscriptionVisibility });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/businesses — ALL businesses, unfiltered by the public
// subscription-visibility rules (unlike GET /api/businesses, which is the
// public-facing, filtered list). Admin needs to see and manage exactly the
// businesses that visibility rules would otherwise hide.
export const getAllBusinessesAdmin = async (req, res) => {
  try {
    const businesses = await Business.find().sort({ createdAt: -1 }).lean();
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// Kill-switch tab: per-business override (separate side tab from the
// global toggle above). Independent of the grandfather exemption below —
// this one is meant as a permanent "always show this business" flag.
// PATCH /api/admin/businesses/:id/visibility-exempt
export const setBusinessVisibilityExempt = async (req, res) => {
  try {
    const { id } = req.params;
    const { exempt } = req.body;
    if (typeof exempt !== "boolean") {
      return res.status(400).json({ message: "'exempt' must be true or false" });
    }

    const business = await Business.findByIdAndUpdate(
      id,
      { visibilityExempt: exempt },
      { new: true }
    );
    if (!business) return res.status(404).json({ message: "Business not found" });

    res.json(business);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// Grandfather-exemption tab: time-boxed override, separate side tab from
// the kill-switch tab above. Pass an ISO date string to exempt the
// business until that date, or null to clear the exemption.
// PATCH /api/admin/businesses/:id/grandfather-exemption
export const setBusinessGrandfatherExemption = async (req, res) => {
  try {
    const { id } = req.params;
    const { exemptUntil } = req.body;

    const business = await Business.findByIdAndUpdate(
      id,
      { grandfatherExemptUntil: exemptUntil ? new Date(exemptUntil) : null },
      { new: true }
    );
    if (!business) return res.status(404).json({ message: "Business not found" });

    res.json(business);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// Marketer management (mirrors the existing business management section).
// GET /api/admin/marketers — list view: one row per marketer with
// referral/payout totals, so admin doesn't have to open each one to see
// whether they're worth reviewing.
export const getAllMarketersAdmin = async (req, res) => {
  try {
    const marketers = await Marketer.find().select("-password").sort({ createdAt: -1 }).lean();

    const payouts = await MarketerPayout.aggregate([
      {
        $group: {
          _id: "$marketerId",
          pendingTotal: {
            $sum: { $cond: [{ $in: ["$status", ["pending", "batched"]] }, "$amount", 0] },
          },
          paidTotal: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$amount", 0] } },
        },
      },
    ]);
    const payoutMap = new Map(payouts.map((p) => [String(p._id), p]));

    const attributionCounts = await ReferralAttribution.aggregate([
      { $match: { referrerType: "marketer" } },
      {
        $group: {
          _id: "$referrerId",
          totalReferred: { $sum: 1 },
          totalConverted: { $sum: { $cond: [{ $eq: ["$status", "converted"] }, 1, 0] } },
        },
      },
    ]);
    const attributionMap = new Map(attributionCounts.map((a) => [String(a._id), a]));

    const result = marketers.map((m) => {
      const payout = payoutMap.get(String(m._id)) || { pendingTotal: 0, paidTotal: 0 };
      const attribution = attributionMap.get(String(m._id)) || { totalReferred: 0, totalConverted: 0 };
      return {
        ...m,
        totalReferred: attribution.totalReferred,
        totalConverted: attribution.totalConverted,
        pendingPayoutTotal: payout.pendingTotal,
        lifetimePaidTotal: payout.paidTotal,
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/marketers/:id — drill-in detail: referral list + full
// payout history for one marketer. Reuses the same shape as the
// marketer's own dashboard (getMarketerDashboard in marketerController.js)
// so the admin view and the marketer's self-view stay consistent.
export const getMarketerDetailAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const marketer = await Marketer.findById(id).select("-password");
    if (!marketer) return res.status(404).json({ message: "Marketer not found" });

    const attributions = await ReferralAttribution.find({
      referrerType: "marketer",
      referrerId: id,
    })
      .populate("referredBusinessId", "name createdAt")
      .sort({ createdAt: -1 });

    const referrals = attributions.map((a) => ({
      id: a._id,
      businessName: a.referredBusinessId?.name || "(business deleted)",
      status: a.status,
      referredAt: a.createdAt,
      convertedAt: a.convertedAt,
    }));

    const payouts = await MarketerPayout.find({ marketerId: id }).sort({ createdAt: -1 });

    res.json({
      marketer,
      referrals,
      payouts,
      stats: {
        totalReferred: referrals.length,
        totalConverted: referrals.filter((r) => r.status === "converted").length,
        pendingPayoutTotal: payouts
          .filter((p) => p.status === "pending" || p.status === "batched")
          .reduce((sum, p) => sum + p.amount, 0),
        lifetimePaidTotal: payouts
          .filter((p) => p.status === "paid")
          .reduce((sum, p) => sum + p.amount, 0),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/admin/marketers/:id/ban — same pattern as toggleUserBan above.
export const toggleMarketerBan = async (req, res) => {
  try {
    const { id } = req.params;
    const { banned } = req.body;

    const marketer = await Marketer.findByIdAndUpdate(id, { banned }, { new: true }).select("-password");
    if (!marketer) return res.status(404).json({ message: "Marketer not found" });

    res.json(marketer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// Unified transactions tab: one feed combining subscription payments,
// marketer payouts, and points-ledger activity, each tagged with a "kind"
// so the frontend can filter by type without hitting three endpoints.
// GET /api/admin/transactions?type=subscription|marketer_payout|points&status=&limit=
export const getTransactions = async (req, res) => {
  try {
    const { type, status, limit } = req.query;
    const cap = Math.min(parseInt(limit, 10) || 200, 500);

    const wantSubscriptions = !type || type === "subscription";
    const wantPayouts = !type || type === "marketer_payout";
    const wantPoints = !type || type === "points";

    const [subs, payouts, points] = await Promise.all([
      wantSubscriptions
        ? SubscriptionPayment.find(status ? { status } : {})
            .populate("businessId", "name")
            .sort({ createdAt: -1 })
            .limit(cap)
            .lean()
        : [],
      wantPayouts
        ? MarketerPayout.find(status ? { status } : {})
            .populate("marketerId", "name email")
            .sort({ createdAt: -1 })
            .limit(cap)
            .lean()
        : [],
      wantPoints
        ? PointsLedger.find(status ? { status } : {})
            .populate("businessId", "name")
            .sort({ createdAt: -1 })
            .limit(cap)
            .lean()
        : [],
    ]);

    const transactions = [
      ...subs.map((s) => ({
        kind: "subscription",
        id: s._id,
        date: s.createdAt,
        amount: s.amount,
        status: s.status,
        planType: s.planType,
        pointsApplied: s.pointsApplied,
        party: s.businessId?.name || "(business deleted)",
        reference: s.paystackReference,
      })),
      ...payouts.map((p) => ({
        kind: "marketer_payout",
        id: p._id,
        date: p.createdAt,
        amount: p.amount,
        status: p.status,
        party: p.marketerId?.name || "(marketer deleted)",
        reference: p.transferReference,
      })),
      ...points.map((pt) => ({
        kind: "points",
        id: pt._id,
        date: pt.createdAt,
        amount: pt.points,
        status: pt.status,
        pointsType: pt.type,
        party: pt.businessId?.name || "(business deleted)",
        reference: pt.transferReference,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ transactions: transactions.slice(0, cap) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};