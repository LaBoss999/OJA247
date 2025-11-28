import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      required: true
    },
    images: {
      type: [String],
      default: []
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    inStock: {
      type: Boolean,
      default: true
    },
    specifications: {
      type: Map,
      of: String
    },
    tags: [String],
    featured: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Index for faster queries
ProductSchema.index({ businessId: 1, category: 1 });
ProductSchema.index({ name: "text", description: "text" });

export default mongoose.model("Product", ProductSchema);