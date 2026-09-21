import mongoose from "mongoose";

const FollowSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
  },
  { timestamps: true }
);

// One follow per customer per business — the unique index is what makes
// followBusiness idempotent (a duplicate POST just hits a duplicate-key
// error the controller treats as "already following", not a real error).
FollowSchema.index({ customerId: 1, businessId: 1 }, { unique: true });
// Supports the follower-count lookup (getBusiness) and, later, the
// new-product-to-followers email (Phase 6) which queries by businessId
// alone.
FollowSchema.index({ businessId: 1 });

export default mongoose.model("Follow", FollowSchema);
