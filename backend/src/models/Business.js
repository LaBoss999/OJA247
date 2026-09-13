import mongoose from "mongoose";

const BusinessSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    category: String,
    location: String,
    contact: String,
    images: [String],
    logo: String,
    banner: String,
    themeColor: String,
    socialLinks: {
      facebook: String,
      instagram: String,
      twitter: String,
      website: String
    },
    highlights: [String],
    deliveryFeeInState: { type: Number, default: 0 },
    deliveryFeeOutState: { type: Number, default: 0 },
    isHidden: { type: Boolean, default: false }, // hides this business from public listings
    featured: { type: Boolean, default: false }, // admin-only — was previously used but missing from schema
    verified: { type: Boolean, default: false }, // admin-only — shown as a trust badge on the storefront
    slug: { type: String, unique: true, sparse: true, lowercase: true, trim: true }, // vendor-editable, readable store URL (e.g. "chioma-fashion")
    // Admin-controlled vendor verification countdown. Null = not started yet,
    // so the business is never auto-hidden regardless of verification tier.
    verificationDeadline: { type: Date, default: null },

    // --- Subscription (new) ---
    subscriptionStatus: {
      type: String,
      enum: ["inactive", "active", "expired"],
      default: "inactive",
    },
    subscriptionExpiresAt: { type: Date, default: null },
    hasPaidFirstSubscription: { type: Boolean, default: false }, // gates the marketer payout rule

    // Tracks which subscription-expiry emails have already gone out for the
    // CURRENT subscriptionExpiresAt value, so the daily cron doesn't re-send
    // the same reminder every day it runs. Both reset to null on the next
    // successful subscription payment (see subscriptionController.js).
    subscriptionReminderSentAt: { type: Date, default: null },
    subscriptionExpiredEmailSentAt: { type: Date, default: null },

    // --- Referral (new) ---
    // This business's OWN code, for referring other businesses (business-owner track)
    referralCode: { type: String, unique: true, sparse: true, uppercase: true },
    // The code THIS business signed up with, if any — captured once, permanent
    referredByCode: { type: String, default: null },
    // Denormalized running total — PointsLedger is the source of truth,
    // this is kept in sync for fast dashboard reads
    pointsBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Business", BusinessSchema);