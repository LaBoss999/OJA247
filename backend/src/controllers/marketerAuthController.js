import jwt from "jsonwebtoken";
import Marketer from "../models/Marketer.js";
import { generateUniqueMarketerCode } from "../services/referralService.js";

const generateToken = (id) => {
  return jwt.sign({ id, type: "marketer" }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Register new marketer
export const registerMarketer = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "Registration failed: name, email, password, and phone are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const exists = await Marketer.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.status(400).json({ message: "This email is already registered." });
    }

    const referralCode = await generateUniqueMarketerCode();

    const marketer = new Marketer({
      name: String(name).trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: String(phone).trim(),
      referralCode,
    });

    const saved = await marketer.save();
    const token = generateToken(saved._id);

    res.status(201).json({
      success: true,
      token,
      marketer: {
        id: saved._id,
        name: saved.name,
        email: saved.email,
        referralCode: saved.referralCode,
      },
    });
  } catch (error) {
    console.error("Marketer registration error:", error);

    let message = "Registration failed. Please review your details and try again.";
    if (error?.code === 11000) {
      message = "This email is already in use.";
    } else if (error?.name === "ValidationError") {
      message = `Registration failed: ${Object.values(error.errors)
        .map((item) => item.message)
        .join("; ")}`;
    }

    res.status(400).json({ message });
  }
};

// Login marketer
export const loginMarketer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const marketer = await Marketer.findOne({ email: email?.toLowerCase().trim() });
    if (!marketer) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (marketer.banned || marketer.status === "suspended") {
      return res.status(403).json({ message: "This marketer account is not active." });
    }

    const isPasswordValid = await marketer.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(marketer._id);

    res.json({
      success: true,
      token,
      marketer: {
        id: marketer._id,
        name: marketer.name,
        email: marketer.email,
        referralCode: marketer.referralCode,
      },
    });
  } catch (error) {
    console.error("Marketer login error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get current marketer
export const getMarketerMe = async (req, res) => {
  try {
    const marketer = await Marketer.findById(req.marketer.id).select("-password");
    res.json({ success: true, marketer });
  } catch (error) {
    console.error("Get marketer me error:", error);
    res.status(500).json({ message: error.message });
  }
};
