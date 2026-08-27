import mongoose from "mongoose";

const VendorSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, unique: true },

    businessName: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    contactWhatsapp: { type: String, default: "" },

    // payout details
    bankCode: { type: String, required: true },
    bankName: { type: String, default: "" },
    accountNumber: { type: String, required: true },
    accountName: { type: String, required: true }, // confirmed via Paystack's resolve-account endpoint
    bankNameMatch: { type: Boolean, default: false },
    subaccountCode: { type: String, required: true }, // used at checkout to build the split
    subaccountId: { type: String, default: "" },

    // KYC
    nin: { type: String, required: true },
    cacDocumentUrl: { type: String, default: null },
    addressProofUrl: { type: String, default: null },
    selfieUrl: { type: String, default: null },
    verificationTier: {
      type: String,
      enum: ["incomplete", "basic", "verified"],
      default: "incomplete",
    },

    onboardingDeadline: { type: Date, required: true },

    // Manual admin review — automatic verificationTier only reflects which
    // documents were submitted, not whether an admin has confirmed them.
    reviewStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewNotes: { type: String, default: "" }, // shown to the vendor, e.g. reason for rejection
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    // Flips to false when an admin makes a decision, true once the vendor has seen it
    notificationSeen: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Vendor", VendorSchema);