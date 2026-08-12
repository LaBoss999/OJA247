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
    slug: { type: String, unique: true, sparse: true, lowercase: true, trim: true } // vendor-editable, readable store URL (e.g. "chioma-fashion")
  },
  { timestamps: true }
);

export default mongoose.model("Business", BusinessSchema);