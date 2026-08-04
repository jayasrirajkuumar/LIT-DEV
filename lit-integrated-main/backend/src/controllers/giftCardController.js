import {

  getGiftCardConfig,

  previewGiftCardPurchase,

  createGiftCard,

  payForGiftCard,

  purchaseGiftCard,

  redeemGiftCard,

  listUserGiftCards,

  getGiftCardById,

} from "../services/giftCardService.js";

import { logger } from "../utils/logger.js";
import { AppError } from "../utils/AppError.js";



export async function getConfig(req, res) {

  const config = await getGiftCardConfig();

  res.json({ success: true, message: "Gift card configuration loaded.", data: { config } });

}



export async function postPreview(req, res) {

  const preview = await previewGiftCardPurchase(req.validatedBody, req.dbUser?.id);

  res.json({ success: true, message: "Purchase preview calculated.", data: preview });

}



export async function postCreate(req, res) {

  const result = await createGiftCard(req.dbUser.id, req.validatedBody);

  res.status(201).json({ success: true, message: "Gift card created.", data: result });

}



export async function postPay(req, res) {

  const result = await payForGiftCard(req.dbUser.id, req.validatedBody.giftCardId, {

    paymentProvider: req.validatedBody.paymentProvider || "MOCK",

  });

  res.json({ success: true, message: "Gift card payment captured.", data: result });

}



export async function postPurchase(req, res) {

  const userId = req.dbUser?.id;

  logger.info("Gift card purchase started", { userId, amount: req.validatedBody?.amount });



  try {

    const result = await purchaseGiftCard(userId, req.validatedBody, {

      paymentProvider: req.validatedBody.paymentProvider || "MOCK",

    });



    logger.info("Gift card purchase completed", {

      userId,

      giftCardId: result.giftCard?.id,

      code: result.giftCard?.giftCardCode,

    });



    return res.status(201).json({

      success: true,

      message: "Gift card purchased successfully.",

      data: result,

    });

  } catch (error) {

    logger.error("Gift card purchase failed", {

      userId,

      message: error.message,

      code: error.code,

      stack: error.stack,

    });

    const status = error instanceof AppError ? error.statusCode : (error?.statusCode ?? 500);

    return res.status(status).json({

      success: false,

      message: error.message || "Gift card purchase failed.",

    });

  }

}



export async function postRedeem(req, res) {

  const result = await redeemGiftCard(req.dbUser.id, req.validatedBody);

  res.json({ success: true, message: "Gift card redeemed successfully.", data: result });

}



export async function getMyGiftCards(req, res) {

  const giftCards = await listUserGiftCards(req.dbUser.id);

  res.json({ success: true, message: "Gift cards loaded.", data: { giftCards } });

}



export async function getGiftCard(req, res) {

  const giftCard = await getGiftCardById(req.dbUser.id, req.params.id);

  res.json({ success: true, message: "Gift card loaded.", data: { giftCard } });

}



export default {

  getConfig,

  postPreview,

  postCreate,

  postPay,

  postPurchase,

  postRedeem,

  getMyGiftCards,

  getGiftCard,

};


