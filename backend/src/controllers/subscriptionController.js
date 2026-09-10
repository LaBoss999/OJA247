import crypto from "crypto";
import Business from "../models/Business.js";
import SubscriptionPayment, { PLAN_PRICES } from "../models/SubscriptionPayment.js";
import PointsLedger from "../models/PointsLedger.js";
import { handleSubscriptionConversion } from "../services/referralService.js";

const PLAN_DURATIONS_DAYS = {
  monthly: 30,
  six_month: 182,
  yearly: 365,
};

function computePeriod(planType, from = new Date()) {
  const periodStart = from;
  const periodEnd = new Date(from);
  periodEnd.setDate(periodEnd.getDate() + PLAN_DURATIONS_DAYS[planType]);
  return { periodStart, periodEnd };
}

// Deducts a payment's applied points from the business's balance and logs
// it, exactly once. Called only once a payment has actually succeeded
// (either fully via points, or after Paystack verification) — never at
// initiate time, so an abandoned/failed payment never costs the vendor points.
async function deductAppliedPoints(payment) {
  if (!payment.pointsApplied || payment.pointsApplied <= 0) return;

  // Safe to call once per payment: the points-only path in initiateSubscription
  // creates the payment already "success" (never re-entering this function),
  // and markSubscriptionPaid only reaches this line on the pending -> success
  // transition, which happens at most once per payment (idempotency guarded above).
  const business = await Business.findById(payment.businessId);
  if (!business) return;

  const newBalance = Math.max(0, (business.pointsBalance || 0) - payment.pointsApplied);

  await PointsLedger.create({
    businessId: payment.businessId,
    type: "redeemed_subscription",
    points: -payment.pointsApplied,
    balanceAfter: newBalance,
    status: "n/a",
  });

  business.pointsBalance = newBalance;
  await business.save();
}

// POST /api/subscriptions/initiate
// Creates the pending SubscriptionPayment record the frontend then charges
// against via the Paystack popup, mirroring orderController's createOrder.
// If the vendor applies enough points to cover the full plan price, no
// Paystack charge is needed at all — the subscription is activated here
// and the frontend skips the payment popup entirely.
export const initiateSubscription = async (req, res) => {
  try {
    const { businessId, planType, pointsToApply } = req.body;

    if (!businessId || !planType) {
      return res.status(400).json({ message: "businessId and planType are required" });
    }
    if (!PLAN_PRICES[planType]) {
      return res.status(400).json({ message: "Invalid planType" });
    }

    // Only the business's own owner (or an admin) can pay for its subscription
    const isOwner = req.user.businessId && req.user.businessId.toString() === businessId;
    if (req.user.role !== "admin" && !isOwner) {
      return res.status(403).json({ message: "Not authorized to pay for this business." });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const planPrice = PLAN_PRICES[planType];
    const pointsBalance = business.pointsBalance || 0;
    const appliedPoints = Math.min(
      Math.max(0, Math.floor(Number(pointsToApply) || 0)),
      pointsBalance,
      planPrice
    );
    const chargeAmount = planPrice - appliedPoints;

    const isFirstPayment = !business.hasPaidFirstSubscription;
    const reference = `oja247-sub-${Date.now()}`;

    const payment = await SubscriptionPayment.create({
      businessId,
      planType,
      amount: planPrice, // always the full plan value, for accounting/marketer-payout accuracy
      pointsApplied: appliedPoints,
      isFirstPayment,
      paystackReference: reference,
      status: chargeAmount <= 0 ? "success" : "pending",
    });

    // Fully covered by points — activate immediately, no Paystack step.
    if (chargeAmount <= 0) {
      const { periodStart, periodEnd } = computePeriod(planType);
      payment.periodStart = periodStart;
      payment.periodEnd = periodEnd;
      await payment.save();

      await Business.findByIdAndUpdate(businessId, {
        subscriptionStatus: "active",
        subscriptionExpiresAt: periodEnd,
        hasPaidFirstSubscription: true,
      });

      await deductAppliedPoints(payment);

      await handleSubscriptionConversion({
        businessId,
        amountPaid: payment.amount,
        planType,
        isFirstPayment,
      });

      return res.status(201).json({
        message: "Subscription paid in full with points",
        fullyPaidWithPoints: true,
        pointsApplied: appliedPoints,
        paymentId: payment._id,
      });
    }

    res.status(201).json({
      message: "Subscription payment initiated",
      reference,
      amount: chargeAmount, // what Paystack should actually charge
      pointsApplied: appliedPoints,
      fullyPaidWithPoints: false,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("Initiate subscription error:", error);
    res.status(500).json({ message: "Error initiating subscription payment" });
  }
};

// Shared by /verify and the webhook — idempotent, safe to call twice for
// the same reference (e.g. if the user's browser confirms AND the webhook
// fires). Only ever processes a payment from pending -> success once.
async function markSubscriptionPaid(reference) {
  const payment = await SubscriptionPayment.findOne({ paystackReference: reference });
  if (!payment) return null;
  if (payment.status === "success") return payment; // already processed, no-op

  payment.status = "success";
  const { periodStart, periodEnd } = computePeriod(payment.planType);
  payment.periodStart = periodStart;
  payment.periodEnd = periodEnd;
  await payment.save();

  await Business.findByIdAndUpdate(payment.businessId, {
    subscriptionStatus: "active",
    subscriptionExpiresAt: periodEnd,
    hasPaidFirstSubscription: true,
  });

  await deductAppliedPoints(payment);

  await handleSubscriptionConversion({
    businessId: payment.businessId,
    amountPaid: payment.amount,
    planType: payment.planType,
    isFirstPayment: payment.isFirstPayment,
  });

  return payment;
}

// POST /api/subscriptions/verify/:reference
export const verifySubscriptionPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    if (!reference) {
      return res.status(400).json({ message: "Payment reference is required" });
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      return res.status(500).json({ message: "Paystack secret key is not configured on the backend" });
    }

    const verificationResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    const verificationData = await verificationResponse.json();

    const payment = await SubscriptionPayment.findOne({ paystackReference: reference });
    if (!payment) {
      return res.status(404).json({ message: "Subscription payment not found" });
    }

    if (!verificationResponse.ok || !verificationData.status || verificationData.data?.status !== "success") {
      payment.status = "failed";
      await payment.save();
      return res.status(400).json({ message: "Payment verification failed", verification: verificationData });
    }

    const paidPayment = await markSubscriptionPaid(reference);

    return res.json({
      message: "Subscription payment verified successfully",
      payment: paidPayment,
    });
  } catch (error) {
    console.error("Verify subscription payment error:", error);
    return res.status(500).json({ message: "Error verifying subscription payment" });
  }
};

// POST /api/subscriptions/webhook
// Source of truth, independent of whether the browser stayed on the page —
// same signature-check pattern as orderController's Paystack webhook.
export const handleSubscriptionWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-paystack-signature"];
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret || !signature || !req.rawBody) {
      return res.sendStatus(401);
    }

    const expectedSignature = crypto.createHmac("sha512", secret).update(req.rawBody).digest("hex");
    if (expectedSignature !== signature) {
      console.error("Subscription webhook: signature mismatch");
      return res.sendStatus(401);
    }

    const event = req.body;

    if (event.event === "charge.success" && event.data?.reference) {
      await markSubscriptionPaid(event.data.reference);
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("Subscription webhook error:", error.message);
    return res.sendStatus(500); // non-2xx so Paystack retries
  }
};
