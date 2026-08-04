import {
  listAdminGiftCards,
  getAdminGiftCardAnalytics,
  getAdminGiftCardById,
  cancelAdminGiftCard,
  listAdminGiftCardTemplates,
  updateAdminGiftCardTemplate,
  resendGiftCardEmail,
} from "../services/adminGiftCardService.js";

export async function getAdminGiftCardsHandler(req, res) {
  const result = await listAdminGiftCards(req.query);
  res.json({ success: true, data: result });
}

export async function getAdminGiftCardAnalyticsHandler(req, res) {
  const analytics = await getAdminGiftCardAnalytics();
  res.json({ success: true, data: { analytics } });
}

export async function getAdminGiftCardHandler(req, res) {
  const giftCard = await getAdminGiftCardById(req.params.id);
  res.json({ success: true, data: { giftCard } });
}

export async function postAdminGiftCardResend(req, res) {
  await resendGiftCardEmail(req.params.id, req.dbUser.id);
  res.json({ success: true, data: { resent: true } });
}

export async function deleteAdminGiftCardHandler(req, res) {
  const result = await cancelAdminGiftCard(req.params.id, req.dbUser.id);
  res.json({ success: true, data: result });
}

export async function getAdminGiftCardTemplatesHandler(req, res) {
  const templates = await listAdminGiftCardTemplates();
  res.json({ success: true, data: { templates } });
}

export async function patchAdminGiftCardTemplateHandler(req, res) {
  const template = await updateAdminGiftCardTemplate(req.params.id, req.body);
  res.json({ success: true, data: { template } });
}

export default {
  getAdminGiftCardsHandler,
  getAdminGiftCardAnalyticsHandler,
  getAdminGiftCardHandler,
  postAdminGiftCardResend,
  deleteAdminGiftCardHandler,
  getAdminGiftCardTemplatesHandler,
  patchAdminGiftCardTemplateHandler,
};
