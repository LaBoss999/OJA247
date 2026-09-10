import mongoose from "mongoose";

// 1 point = ₦1 throughout, per the finalized spec (1000 points earned per
// successful referral = ₦1000).
const PointsLedgerSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },

    type: {
      type: String,
      enum: ["earned", "redeemed_subscription", "withdrawn_cash"],
      required: true,
    },
    points: { type: Number, required: true }, // positive for "earned", negative for redeem/withdraw
    balanceAfter: { type: Number, required: true }, // running balance, denormalized for fast display

    // Present only on "earned" entries
    referralAttributionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReferralAttribution",
      default: null,
    },

    // Present only on "withdrawn_cash" entries — no minimum threshold per spec,
    // but still tracked through a status so payouts can be batched/audited.
    status: {
      type: String,
      enum: ["n/a", "pending", "paid", "failed"],
      default: "n/a",
    },
    transferReference: { type: String, default: "" },
  },
  { timestamps: true }
);

PointsLedgerSchema.index({ businessId: 1, createdAt: -1 });
// An "earned" entry can only be recorded once per conversion
PointsLedgerSchema.index(
  { referralAttributionId: 1 },
  { unique: true, partialFilterExpression: { referralAttributionId: { $type: "objectId" } } }
);

export default mongoose.model("PointsLedger", PointsLedgerSchema);
