import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (req.user.banned) {
      return res.status(403).json({ message: "Account has been banned" });
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Check if user owns the business
export const checkBusinessOwnership = async (req, res, next) => {
  try {
    // Admin can access/manage any business
    if (req.user.role === "admin") {
      return next();
    }

    const businessId = req.params.id;

    if (!req.user.businessId || req.user.businessId.toString() !== businessId) {
      return res.status(403).json({ message: "Not authorized to access this business" });
    }

    next();
  } catch (error) {
    console.error("Ownership check error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};