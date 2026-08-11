import Product from "../models/Product.js";
import Business from "../models/Business.js";

// Get all products across all businesses
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("businessId", "name logo location deliveryFeeInState deliveryFeeOutState")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Get all products error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all products for a specific business
export const getProductsByBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const products = await Product.find({ businessId })
      .populate("businessId", "name logo location deliveryFeeInState deliveryFeeOutState")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Get products by business error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get single product
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "businessId",
      "name logo contact location deliveryFeeInState deliveryFeeOutState"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Create new product
export const createProduct = async (req, res) => {
  try {
    const {
      businessId,
      name,
      description,
      price,
      category,
      images,
      stock,
      specifications,
      tags,
    } = req.body;

    if (!businessId) {
      return res.status(400).json({ message: "businessId is required" });
    }

    // Verify business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const product = new Product({
      businessId,
      name,
      description,
      price,
      category,
      images: images || [],
      stock: stock || 0,
      inStock: stock > 0,
      specifications,
      tags,
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(400).json({ message: error.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.stock !== undefined) {
      updates.inStock = updates.stock > 0;
    }

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(400).json({ message: error.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Search products across all businesses
export const searchProducts = async (req, res) => {
  try {
    const { query, category, minPrice, maxPrice } = req.query;
    let filter = {};

    if (query) {
      filter.$text = { $search: query };
    }
    if (category) {
      filter.category = category;
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter)
      .populate("businessId", "name logo location deliveryFeeInState deliveryFeeOutState")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error("Search products error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get featured products
export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true })
      .populate("businessId", "name logo location deliveryFeeInState deliveryFeeOutState")
      .limit(12)
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error("Get featured products error:", error);
    res.status(500).json({ message: error.message });
  }
};