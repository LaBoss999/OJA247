import express from "express";
import {
  fileDispute,
  getDisputesByBusiness,
  vendorResolveDispute,
} from "../controllers/disputeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public — guest-filed, verified via order reference + matching email
// (see fileDispute), not a login token. No customer account system exists
// yet for this to be gated behind.
router.post("/", fileDispute);

// Vendor's own disputes — self-resolve view (Phase 2). Ownership is
// checked inline in the controller (see getDisputesByBusiness's comment).
router.get("/business/:businessId", protect, getDisputesByBusiness);
router.patch("/:id/resolve", protect, vendorResolveDispute);

// Admin escalation/resolution (Phase 3) live under /api/admin/disputes —
// see adminRoutes.js — same pattern as tax-ledger and other admin-only
// sections that share a controller's model but not its routes.

export default router;