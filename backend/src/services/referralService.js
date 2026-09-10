import crypto from "crypto";
import Business from "../models/Business.js";
import Marketer from "../models/Marketer.js";
import ReferralAttribution from "../models/ReferralAttribution.js";
import MarketerPayout from "../models/MarketerPayout.js";
import PointsLedger from "../models/PointsLedger.js";

// Marketer payout rate is tiered by which plan the referral bought — the rate
// drops as the plan (and payout) grows, so acquisition cost doesn't scale
// linearly with the biggest deals. Keyed by SubscriptionPayment.planType.
const MARKETER_PAYOUT_RATE_BY_PLAN = {
  monthly: 0.5,   // ₦1,999 → ₦1,000
  six_month: 0.35, // ₦9,999 → ₦3,500
  yearly: 0.25,    // ₦17,999 → ₦4,500
};
const BUSINESS_REFERRAL_POINTS = 1000; // 1000 points = ₦1000, 1pt = ₦1 — flat regardless of plan

// --- Code generation -------------------------------------------------

function generateCode(prefix) {
  // 6 random hex chars, uppercase — short enough to share, long enough to
  // make guessing/collision practically impossible alongside the DB unique index
  return `${prefix}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

// Vendor-facing codes are meant to be short, memorable, and eventually
// chosen by the vendor themselves (see updateBusinessReferralCode below),
// so the auto-assigned default at signup uses the same plain 7-char shape
// rather than a "BIZ-" prefixed code — nothing to explain, and it already
// fits the format they'll be picking a replacement in.
const REFERRAL_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I — avoids look-alike mixups
const REFERRAL_CODE_LENGTH = 7;

function generatePlainCode(length = REFERRAL_CODE_LENGTH) {
  let code = "";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    code += REFERRAL_CODE_ALPHABET[bytes[i] % REFERRAL_CODE_ALPHABET.length];
  }
  return code;
}

export async function generateUniqueMarketerCode() {
  let code;
  let exists = true;
  while (exists) {
    code = generateCode("MKT");
    exists = await Marketer.exists({ referralCode: code });
  }
  return code;
}

export async function generateUniqueBusinessReferralCode() {
  let code;
  let exists = true;
  while (exists) {
    code = generatePlainCode();
    exists = await Business.exists({ referralCode: code });
  }
  return code;
}

// A vendor's own referral code, chosen by them: 7-8 characters, letters
// and numbers only. Validates format only — call isBusinessReferralCodeTaken
// separately to check uniqueness before saving.
export function isValidCustomReferralCode(code) {
  return typeof code === "string" && /^[A-Z0-9]{7,8}$/.test(code);
}

export async function isBusinessReferralCodeTaken(code, excludeBusinessId = null) {
  const query = { referralCode: code };
  if (excludeBusinessId) query._id = { $ne: excludeBusinessId };
  return Boolean(await Business.exists(query));
}

// --- Attribution -------------------------------------------------------

/**
 * Call this right after a new Business is created, if a referral code was
 * captured at signup (URL param or manual entry field).
 * Silently no-ops on an invalid/unknown code rather than failing signup.
 */
export async function attributeReferral({ businessId, referralCodeUsed }) {
  if (!referralCodeUsed) return null;

  const code = String(referralCodeUsed).trim().toUpperCase();

  const marketer = await Marketer.findOne({ referralCode: code, banned: false });
  const referringBusiness = marketer ? null : await Business.findOne({ referralCode: code });

  if (!marketer && !referringBusiness) return null; // unknown code — ignore, don't block signup

  try {
    const attribution = await ReferralAttribution.create({
      referrerType: marketer ? "marketer" : "business",
      referrerId: marketer ? marketer._id : referringBusiness._id,
      referrerModel: marketer ? "Marketer" : "Business",
      referralCode: code,
      referredBusinessId: businessId,
    });

    await Business.findByIdAndUpdate(businessId, { referredByCode: code });
    return attribution;
  } catch (err) {
    // Unique index on referredBusinessId — a business can only be attributed once.
    if (err?.code === 11000) return null;
    throw err;
  }
}

// --- Conversion (call this from the subscription payment success handler) --

/**
 * Fires when a SubscriptionPayment transitions to "success".
 * Only the referral's FIRST payment triggers a payout/points award.
 */
export async function handleSubscriptionConversion({
  businessId,
  amountPaid,
  planType,
  isFirstPayment,
}) {
  if (!isFirstPayment) return null;

  const attribution = await ReferralAttribution.findOne({
    referredBusinessId: businessId,
    status: "pending",
  });
  if (!attribution) return null; // this business wasn't referred, or already converted

  attribution.status = "converted";
  attribution.convertedAt = new Date();
  attribution.conversionBaseAmount = amountPaid;
  await attribution.save();

  if (attribution.referrerType === "marketer") {
    const rate = MARKETER_PAYOUT_RATE_BY_PLAN[planType];
    if (rate === undefined) {
      throw new Error(`Unknown planType "${planType}" — cannot determine marketer payout rate`);
    }

    await MarketerPayout.create({
      marketerId: attribution.referrerId,
      referralAttributionId: attribution._id,
      amount: Math.round(amountPaid * rate),
    });
  } else {
    const referringBusiness = await Business.findById(attribution.referrerId);
    const newBalance = (referringBusiness.pointsBalance || 0) + BUSINESS_REFERRAL_POINTS;

    await PointsLedger.create({
      businessId: attribution.referrerId,
      type: "earned",
      points: BUSINESS_REFERRAL_POINTS,
      balanceAfter: newBalance,
      referralAttributionId: attribution._id,
    });
    referringBusiness.pointsBalance = newBalance;
    await referringBusiness.save();
  }

  return attribution;
}
