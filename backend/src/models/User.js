import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: function () {
        return this.role !== "admin"; // only owners need a business
      },
      default: null
    },
    role: {
      type: String,
      enum: ["owner", "admin"],
      default: "owner"
    },
    banned: {
      type: Boolean,
      default: false
    },
    // Set by forgotPassword, cleared by resetPassword or on expiry. Only the
    // SHA-256 hash is stored — the raw token only ever exists in the email
    // link and the reset request body, never in the database.
    resetPasswordTokenHash: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },

    // TOTP 2FA — mandatory for admin accounts only, never offered to
    // owners. totpSecret is written as soon as setup starts (unconfirmed);
    // totpEnabled only flips true once the admin has proven they can
    // generate a valid code with it (see authController.js setup-verify).
    totpSecret: { type: String, default: null, select: false },
    totpEnabled: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", UserSchema);