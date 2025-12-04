import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};

// Optional: Allow both admin and owner
export const requireAdminOrOwner = (req, res, next) => {
  const businessId = req.params.businessId || req.body.businessId;

  if (req.user.role === 'admin') {
    return next(); // Admin can access everything
  }

  if (req.user.businessId.toString() !== businessId) {
    return res.status(403).json({ message: "Not authorized" });
  }

  next();
};