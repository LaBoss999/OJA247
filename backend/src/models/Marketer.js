import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MarketerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, required: true, trim: true },

    // Auto-generated on signup, shared as their referral link/code
    referralCode: { type: String, required: true, unique: true, uppercase: true },

    // Payout details — not required at signup, but required before a payout
    // can be released. Mirrors Vendor.js's payout fields for consistency.
    bankCode: { type: String, default: "" },
    bankName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    accountName: { type: String, default: "" }, // confirmed via Paystack resolve-account
    bankNameMatch: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    banned: { type: Boolean, default: false },

    // Same pattern as User.js — only the SHA-256 hash is ever stored.
    resetPasswordTokenHash: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

MarketerSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

MarketerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Checks before allowing a payout to be requested/batched
MarketerSchema.methods.hasPayoutDetails = function () {
  return Boolean(this.bankCode && this.accountNumber && this.accountName);
};

export default mongoose.model("Marketer", MarketerSchema);