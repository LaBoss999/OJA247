import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Business from "../models/Business.js";
import {
  generateUniqueBusinessReferralCode,
  attributeReferral,
} from "../services/referralService.js";
import { sendVendorWelcomeEmail, sendPasswordResetEmail } from "../services/emailService.js";

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

    const { email, password, businessData, referralCodeUsed } = req.body;

    if (!email || !password || !businessData) {
      return res.status(400).json({
        message: "Registration failed: email, password, and business details are required."
      });
    }

    if (!businessData.name || !businessData.category || !businessData.location || !businessData.contact) {
      return res.status(400).json({
        message: "Registration failed: business name, category, location, and contact are required."
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ message: "Registration failed: this email is already registered." });
    }

    const normalizedBusinessData = {
      ...businessData,
      name: String(businessData.name).trim(),
      description: businessData.description ? String(businessData.description).trim() : "",
      category: String(businessData.category).trim(),
      location: String(businessData.location).trim(),
      contact: String(businessData.contact).trim(),
      logo: businessData.logo || "",
      banner: businessData.banner || "",
      socialLinks: {
        facebook: businessData.socialLinks?.facebook || "",
        instagram: businessData.socialLinks?.instagram || "",
        twitter: businessData.socialLinks?.twitter || "",
        website: businessData.socialLinks?.website || "",
        threads: businessData.socialLinks?.threads || ""
      },
      highlights: Array.isArray(businessData.highlights) ? businessData.highlights.filter(Boolean) : []
    };

    console.log("Creating business...");
    // Every business gets its own referral code (business-owner referral track)
    normalizedBusinessData.referralCode = await generateUniqueBusinessReferralCode();
    const business = new Business(normalizedBusinessData);
    const savedBusiness = await business.save();
    console.log("Business created:", savedBusiness._id);

    // If they signed up via someone else's referral link/code, attribute it.
    // Silently no-ops on an invalid code so it never blocks registration.
    if (referralCodeUsed) {
      await attributeReferral({
        businessId: savedBusiness._id,
        referralCodeUsed,
        ownerEmail: email,
        contact: normalizedBusinessData.contact,
      });
    }

    console.log("Creating user...");
    const user = new User({
      email: email.toLowerCase().trim(),
      password,
      businessId: savedBusiness._id
    });

    const savedUser = await user.save();
    console.log("User created:", savedUser._id);

    // Fire-and-forget — a mail server hiccup should never block registration.
    await sendVendorWelcomeEmail({ to: savedUser.email, businessName: savedBusiness.name });

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

    let message = "Registration failed. Please review your details and try again.";
    if (error?.code === 11000) {
      message = "Registration failed: this email is already in use.";
    } else if (error?.name === "ValidationError") {
      message = `Registration failed: ${Object.values(error.errors)
        .map((item) => item.message)
        .join("; ")}`;
    } else if (error?.message) {
      message = `Registration failed: ${error.message}`;
    }

    res.status(400).json({
      message,
      details: error?.message,
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
        businessId: user.businessId?._id || null,
        role: user.role
      },
      business: user.businessId || null
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
        businessId: user.businessId?._id || null,
        role: user.role
      },
      business: user.businessId || null
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

// POST /api/auth/forgot-password — { email }
// Always responds with the same generic message whether or not the email
// exists, so this endpoint can't be used to check who's registered.
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const genericResponse = {
      success: true,
      message: "If an account exists for that email, a reset link has been sent.",
    };

    if (!email) return res.json(genericResponse);

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.json(genericResponse); // don't reveal whether the email exists

    // Raw token goes in the email link; only its hash is stored, same
    // reasoning as never storing plaintext passwords.
    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordTokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `${process.env.SITE_URL || "https://oja247.store"}/reset-password?token=${rawToken}&type=vendor`;
    sendPasswordResetEmail({ to: user.email, name: "", resetUrl });

    res.json(genericResponse);
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/reset-password — { token, password }
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "This reset link is invalid or has expired" });
    }

    user.password = password; // pre-save hook hashes it
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: error.message });
  }
};