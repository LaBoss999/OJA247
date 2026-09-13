import axios from "axios";
import ReferralAttribution from "../models/ReferralAttribution.js";
import MarketerPayout from "../models/MarketerPayout.js";
import Marketer from "../models/Marketer.js";
import { sendMarketerWithdrawalRequestEmail } from "../services/emailService.js";

const MIN_WITHDRAWAL_AMOUNT = 1000;

// GET /api/marketers/dashboard
// Everything the marketer dashboard needs in one call: their referral list
// with status, plus pending/paid payout totals.
export const getMarketerDashboard = async (req, res) => {
  try {
    const marketerId = req.marketer._id;

    const attributions = await ReferralAttribution.find({
      referrerType: "marketer",
      referrerId: marketerId,
    })
      .populate("referredBusinessId", "name createdAt")
      .sort({ createdAt: -1 });

    const referrals = attributions.map((a) => ({
      id: a._id,
      businessName: a.referredBusinessId?.name || "(business deleted)",
      status: a.status, // "pending" | "converted"
      referredAt: a.createdAt,
      convertedAt: a.convertedAt,
    }));

    const payouts = await MarketerPayout.find({ marketerId });

    const pendingTotal = payouts
      .filter((p) => p.status === "pending" || p.status === "batched")
      .reduce((sum, p) => sum + p.amount, 0);
    const paidTotal = payouts
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      referralCode: req.marketer.referralCode,
      payoutDetails: {
        bankName: req.marketer.bankName || "",
        accountNumber: req.marketer.accountNumber || "",
        accountName: req.marketer.accountName || "",
        hasPayoutDetails: req.marketer.hasPayoutDetails(),
      },
      stats: {
        totalReferred: referrals.length,
        totalConverted: referrals.filter((r) => r.status === "converted").length,
        pendingPayoutTotal: pendingTotal, // owed, not yet paid out
        lifetimePaidTotal: paidTotal,
      },
      referrals,
      payoutHistory: payouts
        .filter((p) => p.status === "paid")
        .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt))
        .map((p) => ({ id: p._id, amount: p.amount, paidAt: p.paidAt })),
    });
  } catch (error) {
    console.error("Get marketer dashboard error:", error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/marketers/withdraw
// On-demand version of the weekly batch job — pulls this marketer's
// "pending" payouts into a batch right now instead of waiting for Monday's
// cron, and emails an admin so it actually gets paid promptly. Still a
// manual bank transfer either way (Paystack Transfers are blocked until the
// Preapproved-tier review finishes) — this just skips the wait for the
// weekly sweep, it doesn't make the payment itself instant.
export const requestMarketerWithdrawal = async (req, res) => {
  try {
    const marketerId = req.marketer._id;

    if (!req.marketer.hasPayoutDetails()) {
      return res.status(400).json({
        message: "Add your payout bank details before requesting a withdrawal.",
      });
    }

    const pendingPayouts = await MarketerPayout.find({ marketerId, status: "pending" });
    const pendingTotal = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);

    if (pendingTotal < MIN_WITHDRAWAL_AMOUNT) {
      return res.status(400).json({
        message: `You need at least ₦${MIN_WITHDRAWAL_AMOUNT.toLocaleString()} pending to request a withdrawal (currently ₦${pendingTotal.toLocaleString()}).`,
      });
    }

    const payoutWeekStart = new Date();
    await MarketerPayout.updateMany(
      { marketerId, status: "pending" },
      { status: "batched", payoutWeekStart }
    );

    sendMarketerWithdrawalRequestEmail({
      marketerName: req.marketer.name,
      marketerEmail: req.marketer.email,
      amount: pendingTotal,
    });

    res.json({
      success: true,
      message: "Withdrawal requested — an admin has been notified and will process it shortly.",
      amountRequested: pendingTotal,
    });
  } catch (error) {
    console.error("Request marketer withdrawal error:", error);
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/marketers/me/payout-details
// Lets a marketer add/update the bank account their weekly payouts get
// sent to. Resolves the account name via Paystack server-side (rather than
// trusting whatever the frontend sends) so bankNameMatch always reflects a
// real, verified lookup — same trust model as vendor onboarding.
export const updateMarketerPayoutDetails = async (req, res) => {
  try {
    const { bank_code, bank_name, account_number } = req.body;

    if (!bank_code || !bank_name || !account_number) {
      return res.status(400).json({
        message: "Bank, and account number are required.",
      });
    }

    let accountName;
    try {
      const response = await axios.get("https://api.paystack.co/bank/resolve", {
        params: { account_number, bank_code },
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      });
      accountName = response.data.data.account_name;
    } catch (err) {
      console.error("Marketer account resolve failed:", err.response?.data || err.message);
      return res.status(400).json({
        message: "Could not verify this account number. Double-check it and try again.",
      });
    }

    const normalize = (s) => s.toLowerCase().replace(/[^a-z\s]/g, "").trim();
    const bankNameMatch =
      normalize(accountName).includes(normalize(req.marketer.name).split(" ")[0]) ||
      normalize(req.marketer.name).includes(normalize(accountName).split(" ")[0]);

    const updated = await Marketer.findByIdAndUpdate(
      req.marketer._id,
      {
        bankCode: bank_code,
        bankName: bank_name,
        accountNumber: account_number,
        accountName,
        bankNameMatch,
      },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Payout details saved.",
      marketer: updated,
    });
  } catch (error) {
    console.error("Update marketer payout details error:", error);
    res.status(500).json({ message: error.message });
  }
};