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
    verificationTier: {
      type: String,
      enum: ["incomplete", "basic", "verified"],
      default: "incomplete",
    },

    onboardingDeadline: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Vendor", VendorSchema);