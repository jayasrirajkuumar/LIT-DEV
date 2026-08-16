import {
  describeUserSearch,
  purchaseInternalGiftCard,
  claimInternalGiftCard,
  declineInternalGiftCard,
  listSentGiftCards,
  listReceivedGiftCards,
  getInternalGiftCard,
} from "../services/internalGiftCardService.js";
import { getWallet } from "../services/walletService.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

export async function getUserSearch(req, res) {
  const q = String(req.query.q || "").trim();
  const result = await describeUserSearch(q, req.dbUser.id);
  res.json({
    success: true,
    message: "Users found.",
    data: {
      users: result.users,
      hint: result.hint,
      matchedSelf: result.matchedSelf,
    },
  });
}

export async function postInternalPurchase(req, res) {
  try {
    if (req.validatedBody.paymentMethod === "WALLET") {
      const wallet = await getWallet(req.dbUser.id);
      const previewAmount = Number(req.validatedBody.amount);
      if (wallet.walletBalance < previewAmount) {
        throw new AppError("Insufficient Wallet Balance. Please use Razorpay.", 400, "INSUFFICIENT_BALANCE");
      }
    }
    const result = await purchaseInternalGiftCard(req.dbUser.id, req.validatedBody);
    res.status(201).json({ success: true, message: "Gift card sent successfully.", data: result });
  } catch (error) {
    logger.error("Internal gift card purchase failed", { message: error.message, userId: req.dbUser.id });
    const status = error?.statusCode ?? 500;
    res.status(status).json({ success: false, message: error.message || "Purchase failed." });
  }
}

export async function postClaim(req, res) {
  const result = await claimInternalGiftCard(req.dbUser.id, req.validatedBody.giftCardId);
  res.json({ success: true, message: "Gift card claimed. Wallet credited.", data: result });
}

export async function postDecline(req, res) {
  const result = await declineInternalGiftCard(req.dbUser.id, req.validatedBody.giftCardId);
  res.json({ success: true, message: "Gift card declined.", data: result });
}

export async function getMySent(req, res) {
  const giftCards = await listSentGiftCards(req.dbUser.id);
  res.json({ success: true, message: "Sent gift cards loaded.", data: { giftCards } });
}

export async function getMyReceived(req, res) {
  const giftCards = await listReceivedGiftCards(req.dbUser.id);
  res.json({ success: true, message: "Received gift cards loaded.", data: { giftCards } });
}

export async function getInternalCard(req, res) {
  const giftCard = await getInternalGiftCard(req.dbUser.id, req.params.id);
  res.json({ success: true, message: "Gift card loaded.", data: { giftCard } });
}

export default {
  getUserSearch,
  postInternalPurchase,
  postClaim,
  postDecline,
  getMySent,
  getMyReceived,
  getInternalCard,
};
