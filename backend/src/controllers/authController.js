import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Business from "../models/Business.js";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d"
  });
};

// Register new business owner
export const register = async (req, res) => {
  try {
    console.log("Register request received:", req.body);
    
    const { email, password, businessData } = req.body;

    // Validate input
    if (!email || !password || !businessData) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create business first
    console.log("Creating business...");
    const business = new Business(businessData);
    const savedBusiness = await business.save();
    console.log("Business created:", savedBusiness._id);

    // Create user and link to business
    console.log("Creating user...");
    const user = new User({
      email,
      password,
      businessId: savedBusiness._id
    });

    const savedUser = await user.save();
    console.log("User created:", savedUser._id);

    // Generate token
    const token = generateToken(savedUser._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: savedUser._id,
        email: savedUser.email,
        businessId: savedBusiness._id,
        role: savedUser.role
      },
      business: savedBusiness
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Login business owner
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).populate("businessId");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        businessId: user.businessId._id,
        role: user.role
      },
      business: user.businessId
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get current user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("businessId");

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        businessId: user.businessId._id,
        role: user.role
      },
      business: user.businessId
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    // Check current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ message: error.message });
  }
};