import jwt from "jsonwebtoken";
import Marketer from "../models/Marketer.js";

export const protectMarketer = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "marketer") {
      return res.status(401).json({ message: "Not authorized for marketer routes" });
    }

    req.marketer = await Marketer.findById(decoded.id).select("-password");

    if (!req.marketer) {
      return res.status(401).json({ message: "Marketer not found" });
    }

    if (req.marketer.banned || req.marketer.status === "suspended") {
      return res.status(403).json({ message: "Account is not active" });
    }

    next();
  } catch (error) {
    console.error("Marketer auth middleware error:", error);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
