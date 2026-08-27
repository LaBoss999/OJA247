import express from "express";
import multer from "multer";
import path from "path";
import { getBanks, resolveAccount, onboardVendor } from "../controllers/vendorController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Memory storage — Vercel's filesystem is read-only/ephemeral, so files are
// buffered in memory and streamed straight to Cloudinary in the controller.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error("Only PDF, JPG, or PNG files are allowed"));
    }
    cb(null, true);
  },
});

// Verified-tier fields (CAC + address proof) are optional at submission —
// vendor can upgrade later.
const uploadFields = upload.fields([
  { name: "cac_document", maxCount: 1 },
  { name: "address_proof", maxCount: 1 },
]);

router.get("/banks", getBanks);
router.get("/resolve-account", resolveAccount);
router.post("/", protect, uploadFields, onboardVendor);

export default router;
