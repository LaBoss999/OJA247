import mongoose from "mongoose";

const MarketerPayoutSchema = new mongoose.Schema(
  {
    marketerId: { type: mongoose.Schema.Types.ObjectId, ref: "Marketer", required: true },
    referralAttributionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReferralAttribution",
      required: true,
      unique: true, // one payout per conversion — hard stop against double-paying
    },
    amount: { type: Number, required: true }, // 50% of the referral's first subscription payment

    status: {
      type: String,
      enum: ["pending", "batched", "paid", "failed"],
      default: "pending",
    },
    // Set when the weekly batch job picks this up
    payoutWeekStart: { type: Date, default: null },
    paidAt: { type: Date, default: null },
    // Filled in once the transfer mechanism (Paystack transfers vs. other) is decided
    transferReference: { type: String, default: "" },
    failureReason: { type: String, default: "" },
  },
  { timestamps: true }
);

MarketerPayoutSchema.index({ marketerId: 1, status: 1 });

export default mongoose.model("MarketerPayout", MarketerPayoutSchema);
