import mongoose from "mongoose";
import Business from "../models/Business.js";

// Turns "Chioma Fashion & Co." into "chioma-fashion-co"
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // strip anything that isn't a letter, number, space, or hyphen
    .replace(/[\s_]+/g, "-") // spaces/underscores -> hyphen
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-|-$/g, ""); // trim leading/trailing hyphen

// Generates a unique slug, appending -2, -3, etc. if the base slug is taken.
// excludeId lets an update skip colliding with the business's own current slug.
const generateUniqueSlug = async (name, excludeId = null) => {
  const base = slugify(name) || "store";
  let slug = base;
  let suffix = 2;

  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };

    const existing = await Business.findOne(query);
    if (!existing) return slug;

    slug = `${base}-${suffix}`;
    suffix += 1;
  }
};

// GET all
export const getBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find();
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching businesses" });
  }
};

// GET one — accepts either a Mongo ObjectId or a slug, so old links
// (/business/<id>) and new readable links (/business/<slug>) both work.
export const getBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    const business = mongoose.Types.ObjectId.isValid(id)
      ? await Business.findById(id)
      : await Business.findOne({ slug: id });

    if (!business) return res.status(404).json({ message: "Not found" });
    res.json(business);
  } catch (error) {
    res.status(500).json({ message: "Error fetching business" });
  }
};

// POST new
export const createBusiness = async (req, res) => {
  try {
    const slug = await generateUniqueSlug(req.body.name || "store");

    const newBusiness = new Business({ ...req.body, slug });
    const saved = await newBusiness.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: "Error creating business" });
  }
};

// PUT update
export const updateBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedFields = [
      "name",
      "description",
      "category",
      "location",
      "contact",
      "logo",
      "banner",
      "themeColor",
      "socialLinks",
      "highlights",
      "deliveryFeeInState",
      "deliveryFeeOutState",
      "slug",
      // Note: "featured" and "verified" are deliberately excluded — those
      // are admin-only and set through /api/admin/businesses/:id/featured
      // and /api/admin/businesses/:id/verified instead.
    ];

    const sanitizedUpdates = {};
    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        sanitizedUpdates[field] = updates[field];
      }
    });

    // If the vendor supplied a custom slug, normalize + guarantee it's unique
    // (excluding their own current business from the collision check).
    if (sanitizedUpdates.slug !== undefined) {
      const cleanSlug = slugify(sanitizedUpdates.slug);
      if (!cleanSlug) {
        return res.status(400).json({ message: "Store link can't be empty." });
      }

      const existing = await Business.findOne({ slug: cleanSlug, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ message: "That store link is already taken. Try another." });
      }

      sanitizedUpdates.slug = cleanSlug;
    }

    const updatedBusiness = await Business.findByIdAndUpdate(id, sanitizedUpdates, {
      new: true,
      runValidators: true,
    });

    if (!updatedBusiness) {
      return res.status(404).json({ message: "Business not found" });
    }

    res.json(updatedBusiness);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "That store link is already taken. Try another." });
    }
    res.status(400).json({ message: error.message });
  }
};