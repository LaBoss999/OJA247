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
    isHidden: { type: Boolean, default: false } // hides this business from public listings
  },
  { timestamps: true }
);

export default mongoose.model("Business", BusinessSchema);