import {
  listUserConversations,
  listAdminConversations,
  listConversationMessages,
  markConversationRead,
  sendConversationMessage,
  getSupportChatStats,
} from "../services/supportMessageService.js";
import { createSupportConversation } from "../services/supportService.js";
import { uploadSupportAttachment } from "../services/supportAttachmentService.js";

export async function getUserConversations(req, res) {
  const conversations = await listUserConversations(req.dbUser.id, req.dbUser.email);
  res.json({ success: true, data: { conversations } });
}

export async function postUserConversation(req, res) {
  const result = await createSupportConversation(req.dbUser.id, req.validatedBody);
  res.status(201).json({ success: true, data: result });
}

export async function getUserConversationMessages(req, res) {
  const messages = await listConversationMessages(req.params.id, req.dbUser);
  res.json({ success: true, data: { messages } });
}

export async function postUserConversationMessage(req, res) {
  const result = await sendConversationMessage({
    conversationId: req.params.id,
    user: req.dbUser,
    message: req.validatedBody.message,
    attachmentUrl: req.validatedBody.attachmentUrl ?? null,
    attachmentType: req.validatedBody.attachmentType ?? null,
  });
  res.status(201).json({ success: true, data: result });
}

export async function patchUserConversationRead(req, res) {
  const result = await markConversationRead(req.params.id, req.dbUser);
  res.json({ success: true, data: result });
}

export async function postUserSupportAttachment(req, res) {
  const uploaded = await uploadSupportAttachment(req.file);
  res.status(201).json({ success: true, data: uploaded });
}

export async function getAdminConversations(req, res) {
  const conversations = await listAdminConversations({
    status: req.query.status,
    priority: req.query.priority,
    search: req.query.search,
    dateFrom: req.query.dateFrom,
    dateTo: req.query.dateTo,
    assignedToId: req.query.assignedToId,
    limit: req.query.limit ? Number(req.query.limit) : 100,
  });
  res.json({ success: true, data: { conversations } });
}

export async function getAdminConversationMessages(req, res) {
  const messages = await listConversationMessages(req.params.id, req.dbUser, { admin: true });
  res.json({ success: true, data: { messages } });
}

export async function postAdminConversationMessage(req, res) {
  const result = await sendConversationMessage({
    conversationId: req.params.id,
    user: req.dbUser,
    admin: true,
    message: req.body.message,
    attachmentUrl: req.body.attachmentUrl ?? null,
    attachmentType: req.body.attachmentType ?? null,
    sendEmail: Boolean(req.body.sendEmail),
  });
  res.status(201).json({ success: true, data: result });
}

export async function patchAdminConversationRead(req, res) {
  const result = await markConversationRead(req.params.id, req.dbUser, { admin: true });
  res.json({ success: true, data: result });
}

export async function postAdminSupportAttachment(req, res) {
  const uploaded = await uploadSupportAttachment(req.file);
  res.status(201).json({ success: true, data: uploaded });
}

export async function getAdminChatStats(req, res) {
  const stats = await getSupportChatStats();
  res.json({ success: true, data: { support: stats } });
}

export default {
  getUserConversations,
  postUserConversation,
  getUserConversationMessages,
  postUserConversationMessage,
  patchUserConversationRead,
  postUserSupportAttachment,
  getAdminConversations,
  getAdminConversationMessages,
  postAdminConversationMessage,
  patchAdminConversationRead,
  postAdminSupportAttachment,
  getAdminChatStats,
};
