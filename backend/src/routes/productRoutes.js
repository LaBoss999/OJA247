import express from "express";
import {
  getProductsByBusiness,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getFeaturedProducts
} from "../controllers/productController.js";
import { protect, checkBusinessOwnership } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes (require login)
router.post("/", protect, createProduct);  // Create product
router.put("/:id", protect, updateProduct);  // Update product
router.delete("/:id", protect, deleteProduct);  // Delete product

// Product routes
router.get("/search", searchProducts);              // Search products
router.get("/featured", getFeaturedProducts);       // Get featured products
router.get("/business/:businessId", getProductsByBusiness); // Get all products for a business
router.get("/:id", getProduct);                     // Get single product

export default router;