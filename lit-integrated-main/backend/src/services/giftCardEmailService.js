import { emailService } from "./emailService.js";
import config from "../config/env.js";

function luxuryEmailWrapper(content) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(180deg,#0a0a0f,#1a1033);padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:rgba(18,12,32,0.95);border:1px solid rgba(147,51,234,0.35);border-radius:20px;padding:32px;">
        <tr><td align="center" style="padding-bottom:24px;">
          <span style="color:#a855f7;font-size:14px;letter-spacing:3px;">LUXURY IN TASTE</span>
        </td></tr>
        ${content}
        <tr><td style="padding-top:32px;text-align:center;color:rgba(255,255,255,0.4);font-size:12px;">
          © Luxury In Taste · Premium Digital Gifting
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function formatAmount(amount, currency = "INR") {
  return currency === "INR" ? `₹${Number(amount).toLocaleString("en-IN")}` : `${currency} ${amount}`;
}

export const giftCardEmailService = {
  async sendRecipientGiftCard({ card, pin }) {
    const redeemUrl = card.qrCodeData || `${config.frontendUrl || "http://localhost:5173"}/gift-cards/redeem?code=${encodeURIComponent(card.giftCardCode)}`;
    const html = luxuryEmailWrapper(`
      <tr><td style="color:#fff;font-size:22px;text-align:center;padding-bottom:8px;">
        You've Received a Gift Card
      </td></tr>
      <tr><td style="color:rgba(255,255,255,0.7);text-align:center;padding-bottom:24px;">
        ${card.senderName} sent you a luxury gift
      </td></tr>
      <tr><td style="background:linear-gradient(135deg,#1e1033,#7c3aed);border-radius:16px;padding:24px;text-align:center;margin-bottom:20px;">
        <div style="color:rgba(255,255,255,0.8);font-size:14px;">Gift Card Value</div>
        <div style="color:#fff;font-size:36px;font-weight:bold;">${formatAmount(card.amount)}</div>
        ${card.message ? `<p style="color:rgba(255,255,255,0.85);font-style:italic;margin-top:16px;">"${card.message}"</p>` : ""}
      </td></tr>
      <tr><td style="padding:20px 0;color:#fff;">
        <p><strong>Hi ${card.recipientName},</strong></p>
        <p style="color:rgba(255,255,255,0.75);">${card.senderName} has gifted you a LIT Marketplace gift card for <strong>${card.occasion}</strong>.</p>
        <table width="100%" style="margin:20px 0;background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;">
          <tr><td style="color:rgba(255,255,255,0.6);padding:6px 0;">Gift Code</td><td style="color:#c084fc;font-family:monospace;font-size:18px;text-align:right;">${card.giftCardCode}</td></tr>
          <tr><td style="color:rgba(255,255,255,0.6);padding:6px 0;">PIN</td><td style="color:#fff;font-family:monospace;font-size:18px;text-align:right;">${pin}</td></tr>
          <tr><td style="color:rgba(255,255,255,0.6);padding:6px 0;">Expires</td><td style="color:#fff;text-align:right;">${new Date(card.expiryDate).toLocaleDateString()}</td></tr>
        </table>
        <p style="text-align:center;margin:28px 0;">
          <a href="${redeemUrl}" style="background:linear-gradient(135deg,#9333ea,#7c3aed);color:#fff;text-decoration:none;padding:14px 32px;border-radius:999px;font-size:16px;display:inline-block;">Redeem Gift Card</a>
        </p>
      </td></tr>
    `);

    await emailService.sendMail({
      to: card.recipientEmail,
      subject: `${card.senderName} sent you a LIT Gift Card 🎁`,
      html,
      text: [
        `Hi ${card.recipientName},`,
        `${card.senderName} sent you a ${formatAmount(card.amount)} LIT gift card.`,
        `Code: ${card.giftCardCode}`,
        `PIN: ${pin}`,
        `Redeem: ${redeemUrl}`,
        card.message ? `Message: ${card.message}` : "",
      ].join("\n"),
    });
  },

  async sendInternalGiftCardReceived({ card, senderName }) {
    const appUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const html = luxuryEmailWrapper(`
      <tr><td style="color:#fff;font-size:22px;text-align:center;">You've received a LIT Gift Card!</td></tr>
      <tr><td style="color:rgba(255,255,255,0.75);padding:20px 0;text-align:center;">
        Hi ${card.recipientName},<br><br>
        <strong>${senderName}</strong> has sent you a ${formatAmount(card.amount)} Gift Card.
        ${card.message ? `<p style="font-style:italic;margin-top:16px;">"${card.message}"</p>` : ""}
        <p style="text-align:center;margin:28px 0;">
          <a href="${appUrl}/gift-cards/received/${card.id}" style="background:linear-gradient(135deg,#9333ea,#7c3aed);color:#fff;text-decoration:none;padding:14px 32px;border-radius:999px;font-size:16px;display:inline-block;">Open LIT to Claim</a>
        </p>
      </td></tr>
    `);
    if (card.recipientEmail) {
      await emailService.sendMail({
        to: card.recipientEmail,
        subject: "You've received a LIT Gift Card!",
        html,
        text: `Hi ${card.recipientName}, ${senderName} sent you a ${formatAmount(card.amount)} LIT Gift Card. Open the app to claim.`,
      });
    }
  },

  async sendSenderConfirmation({ card }) {
    const html = luxuryEmailWrapper(`
      <tr><td style="color:#fff;font-size:22px;text-align:center;">Gift Card Sent!</td></tr>
      <tr><td style="color:rgba(255,255,255,0.75);padding:20px 0;text-align:center;">
        Your gift card for <strong>${card.recipientName}</strong> (${formatAmount(card.amount)}) has been ${card.deliveryType === "SCHEDULED" ? "scheduled" : "delivered"}.
        <br><br>Code: <span style="color:#c084fc;font-family:monospace;">${card.giftCardCode}</span>
      </td></tr>
    `);

    const sender = card.senderId
      ? await import("../database/prismaClient.js").then((m) =>
          m.prisma.user.findUnique({ where: { id: card.senderId }, select: { email: true } }),
        )
      : null;

    if (sender?.email) {
      await emailService.sendMail({
        to: sender.email,
        subject: `Gift card confirmation — ${card.giftCardCode}`,
        html,
        text: `Your gift card ${card.giftCardCode} for ${card.recipientName} is confirmed.`,
      });
    }
  },
};

export default giftCardEmailService;
