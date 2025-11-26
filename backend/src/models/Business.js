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
    products: [
      {
        name: String,
        description: String,
        price: Number,
        image: String
      }
    ],
    highlights: [String]
  },
  { timestamps: true }
);

export default mongoose.model("Business", BusinessSchema);
