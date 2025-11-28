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

const router = express.Router();

// Product routes
router.get("/search", searchProducts);              // Search products
router.get("/featured", getFeaturedProducts);       // Get featured products
router.get("/business/:businessId", getProductsByBusiness); // Get all products for a business
router.get("/:id", getProduct);                     // Get single product
router.post("/", createProduct);                    // Create product
router.put("/:id", updateProduct);                  // Update product
router.delete("/:id", deleteProduct);               // Delete product

export default router;