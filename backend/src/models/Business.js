import mongoose from "mongoose";

const BusinessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: String,
  location: String,
  contact: String,
  images: [String],
}, { timestamps: true });

export default mongoose.model("Business", BusinessSchema);
