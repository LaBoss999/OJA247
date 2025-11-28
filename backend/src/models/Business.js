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
       // ❌ REMOVED: products: [...]
    highlights: [String]
  },
  { timestamps: true }
);

export default mongoose.model("Business", BusinessSchema);
