import Business from "../models/Business.js";
import Vendor from "../models/Vendor.js";
import ReferralAttribution from "../models/ReferralAttribution.js";
import PointsLedger from "../models/PointsLedger.js";

// GET /api/businesses/:id/points
export const getPointsDashboard = async (req, res) => {
  try {
    const businessId = req.params.id;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const attributions = await ReferralAttribution.find({
      referrerType: "business",
      referrerId: businessId,
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

    const ledger = await PointsLedger.find({ businessId }).sort({ createdAt: -1 }).limit(50);

    res.json({
      success: true,
      referralCode: business.referralCode,
      pointsBalance: business.pointsBalance || 0,
      referrals,
      ledger: ledger.map((entry) => ({
        id: entry._id,
        type: entry.type,
        points: entry.points,
        balanceAfter: entry.balanceAfter,
        status: entry.status,
        createdAt: entry.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get points dashboard error:", error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/businesses/:id/points/withdraw
// Cash withdrawal, no minimum threshold per spec. Requires the business to
// already have verified bank details on file (via Vendor onboarding) —
// reuses the same payout account rather than collecting a second one.
export const withdrawPoints = async (req, res) => {
  try {
    const businessId = req.params.id;
    const { amount } = req.body;

    const requestedAmount = Number(amount);
    if (!requestedAmount || requestedAmount <= 0) {
      return res.status(400).json({ message: "A valid withdrawal amount is required" });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    if (requestedAmount > (business.pointsBalance || 0)) {
      return res.status(400).json({ message: "Withdrawal amount exceeds your points balance" });
    }

    const vendor = await Vendor.findOne({ businessId });
    if (!vendor || !vendor.accountNumber || !vendor.bankCode) {
      return res.status(400).json({
        message: "Complete your vendor payout details (bank account) before withdrawing points.",
      });
    }

    const newBalance = business.pointsBalance - requestedAmount;

    const entry = await PointsLedger.create({
      businessId,
      type: "withdrawn_cash",
      points: -requestedAmount,
      balanceAfter: newBalance,
      status: "pending", // released via the same payout mechanism as marketer payouts, once decided
    });

    business.pointsBalance = newBalance;
    await business.save();

    res.json({
      success: true,
      message: "Withdrawal requested — it will be processed shortly.",
      entry,
      pointsBalance: newBalance,
    });
  } catch (error) {
    console.error("Withdraw points error:", error);
    res.status(500).json({ message: error.message });
  }
};
