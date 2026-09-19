import axios from "axios";

// Twilio WhatsApp — see env.example for the four vars this needs.
// WhatsApp requires a pre-approved message template for any
// business-initiated message (an order alert isn't a reply in an existing
// chat, so free-form text isn't allowed here — see the template text this
// integration expects, documented alongside TWILIO_ORDER_ALERT_CONTENT_SID
// in env.example).
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM; // e.g. "whatsapp:+14155238886"
const TWILIO_ORDER_ALERT_CONTENT_SID = process.env.TWILIO_ORDER_ALERT_CONTENT_SID;

const TWILIO_API_URL = TWILIO_ACCOUNT_SID
  ? `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`
  : null;

function baseConfigured() {
  return Boolean(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_FROM);
}

// True once every var needed to actually send an order alert is present —
// exported so the rest of the app can check before bothering to build a
// message (same pattern as emailService's getTransporter returning null).
export function whatsappConfigured() {
  return baseConfigured() && Boolean(TWILIO_ORDER_ALERT_CONTENT_SID);
}

// Normalizes a Nigerian number in whatever common local shape a vendor
// typed into onboarding (080..., 0803..., +234..., 234..., or a bare
// 10-digit number missing its leading 0) into E.164, which is what
// Twilio/WhatsApp require. Not a general phone parser — just the shapes
// this app's own onboarding form actually produces. Returns null for
// anything it can't confidently normalize, so the caller skips sending
// rather than guessing and hitting a bad number.
export function toE164Nigeria(rawNumber) {
  if (!rawNumber) return null;
  const digits = String(rawNumber).replace(/\D/g, "");
  if (digits.startsWith("234") && digits.length === 13) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 11) return `+234${digits.slice(1)}`;
  if (digits.length === 10) return `+234${digits}`;
  return null;
}

async function sendWhatsAppTemplate({ to, contentSid, variables }) {
  if (!baseConfigured()) {
    console.warn(
      "WhatsApp not sent: TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_WHATSAPP_FROM not set."
    );
    return { sent: false };
  }

  const e164 = toE164Nigeria(to);
  if (!e164) {
    console.warn(`WhatsApp not sent: couldn't normalize phone number "${to}" to E.164.`);
    return { sent: false };
  }

  try {
    const params = new URLSearchParams();
    params.append("From", TWILIO_WHATSAPP_FROM);
    params.append("To", `whatsapp:${e164}`);
    params.append("ContentSid", contentSid);
    params.append("ContentVariables", JSON.stringify(variables));

    await axios.post(TWILIO_API_URL, params, {
      auth: { username: TWILIO_ACCOUNT_SID, password: TWILIO_AUTH_TOKEN },
    });
    return { sent: true };
  } catch (error) {
    const reason = error.response?.data?.message || error.message;
    console.error(`WhatsApp send failed (to: ${to}):`, reason);
    return { sent: false, error: reason };
  }
}

// Template text to submit for approval (WhatsApp Business template, numbered
// placeholders {{1}}-{{6}} map to the variables below in order):
//
//   New order on OJA247! 🛍️
//   Order: {{1}}
//   Customer: {{2}} ({{3}})
//   Items: {{4}}
//   Total: ₦{{5}}
//   Full details: {{6}}
//
// Once Twilio/Meta approve it, its Content SID goes in
// TWILIO_ORDER_ALERT_CONTENT_SID.
export async function sendVendorNewOrderWhatsApp({
  to,
  orderReference,
  customerName,
  customerPhone,
  itemsSummary,
  total,
  dashboardUrl,
}) {
  if (!TWILIO_ORDER_ALERT_CONTENT_SID) {
    console.warn("WhatsApp not sent: TWILIO_ORDER_ALERT_CONTENT_SID not set (approved template required).");
    return { sent: false };
  }

  return sendWhatsAppTemplate({
    to,
    contentSid: TWILIO_ORDER_ALERT_CONTENT_SID,
    variables: {
      1: orderReference,
      2: customerName || "Customer",
      3: customerPhone || "",
      4: itemsSummary,
      5: Number(total).toLocaleString(),
      6: dashboardUrl,
    },
  });
}   