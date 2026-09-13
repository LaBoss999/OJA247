import User from "../models/User.js";
import Business from "../models/Business.js";
import { sendSubscriptionExpiringEmail, sendSubscriptionExpiredEmail } from "../services/emailService.js";

const REMINDER_WINDOW_DAYS = 4; // matches the in-dashboard popup's warning window

async function getOwnerEmail(businessId) {
  const owner = await User.findOne({ businessId }).select("email");
  return owner?.email || null;
}

// GET /api/cron/subscription-expiry  (called daily by Vercel Cron — see vercel.json)
// Two passes: businesses with 0-4 days left get a reminder (once per
// subscription period — see subscriptionReminderSentAt), and businesses
// already past subscriptionExpiresAt get an "expired" notice (once per
// period — subscriptionExpiredEmailSentAt). Both flags reset to null the
// next time a subscription payment succeeds (subscriptionController.js),
// so a renewed business can be reminded again on its next cycle.
export const runSubscriptionExpiryCheck = async (req, res) => {
  try {
    const cronSecret = req.headers["authorization"];
    if (!process.env.CRON_SECRET || cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const now = new Date();
    const reminderCutoff = new Date(now.getTime() + REMINDER_WINDOW_DAYS * 24 * 60 * 60 * 1000);

    // --- Pass 1: expiring soon (0-4 days left, not yet reminded) ---
    const expiringSoon = await Business.find({
      subscriptionExpiresAt: { $gte: now, $lte: reminderCutoff },
      subscriptionReminderSentAt: null,
    }).select("name subscriptionExpiresAt");

    for (const business of expiringSoon) {
      const daysLeft = Math.ceil((business.subscriptionExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const to = await getOwnerEmail(business._id);
      if (to) {
        await sendSubscriptionExpiringEmail({
          to,
          businessName: business.name,
          daysLeft,
          expiresAt: business.subscriptionExpiresAt,
        });
      }
      business.subscriptionReminderSentAt = now;
      await business.save();
    }

    // --- Pass 2: already expired (not yet notified) ---
    const expired = await Business.find({
      subscriptionExpiresAt: { $lt: now },
      subscriptionExpiredEmailSentAt: null,
    }).select("name");

    for (const business of expired) {
      const to = await getOwnerEmail(business._id);
      if (to) {
        await sendSubscriptionExpiredEmail({ to, businessName: business.name });
      }
      business.subscriptionExpiredEmailSentAt = now;
      await business.save();
    }

    res.json({
      success: true,
      remindersSent: expiringSoon.length,
      expiredNoticesSent: expired.length,
    });
  } catch (error) {
    console.error("Subscription expiry check error:", error);
    res.status(500).json({ message: error.message });
  }
};