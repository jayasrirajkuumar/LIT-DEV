import {
  getSupportWorkspace,
  addInternalNote,
  updateConversationPriority,
  escalateConversation,
  workspaceAssignTicket,
  workspaceUpdateStatus,
} from "../services/supportWorkspaceService.js";
import {
  updateOrderShippingFromSupport,
  cancelOrderFromSupport,
  initiateRefundFromSupport,
  approveReturnFromSupport,
  rejectReturnFromSupport,
  reshipOrderFromSupport,
  updateCustomerContactFromSupport,
  updateCustomerContactByConversation,
} from "../services/supportOrderActionsService.js";

export async function getAdminSupportWorkspace(req, res) {
  const workspace = await getSupportWorkspace(req.params.id, req.dbUser);
  res.json({ success: true, data: { workspace } });
}

export async function postAdminInternalNote(req, res) {
  const note = await addInternalNote(req.params.id, req.dbUser.id, req.body.note);
  res.status(201).json({ success: true, data: { note } });
}

export async function patchAdminConversationPriority(req, res) {
  const result = await updateConversationPriority(req.params.id, req.dbUser.id, req.body.priority);
  res.json({ success: true, data: result });
}

export async function postAdminEscalateTicket(req, res) {
  const result = await escalateConversation(req.params.id, req.dbUser.id);
  res.json({ success: true, data: result });
}

export async function patchAdminWorkspaceAssign(req, res) {
  const result = await workspaceAssignTicket(req.params.id, req.dbUser.id, req.body.assignedToId);
  res.json({ success: true, data: result });
}

export async function patchAdminWorkspaceStatus(req, res) {
  const result = await workspaceUpdateStatus(req.params.id, req.dbUser.id, req.body.status);
  res.json({ success: true, data: result });
}

export async function patchAdminWorkspaceShippingAddress(req, res) {
  const result = await updateOrderShippingFromSupport({
    orderId: req.params.orderId,
    conversationId: req.body.conversationId,
    adminUserId: req.dbUser.id,
    payload: req.body,
  });
  res.json({ success: true, data: result });
}

export async function postAdminWorkspaceCancelOrder(req, res) {
  const order = await cancelOrderFromSupport({
    orderId: req.params.orderId,
    conversationId: req.body.conversationId,
    adminUserId: req.dbUser.id,
    reasonCode: req.body.reasonCode,
    reasonText: req.body.reasonText,
  });
  res.json({ success: true, data: { order } });
}

export async function postAdminWorkspaceRefund(req, res) {
  const result = await initiateRefundFromSupport({
    orderId: req.params.orderId,
    conversationId: req.body.conversationId,
    adminUserId: req.dbUser.id,
    refundType: req.body.refundType,
    amount: req.body.amount,
    reason: req.body.reason,
  });
  res.json({ success: true, data: result });
}

export async function postAdminWorkspaceApproveReturn(req, res) {
  const order = await approveReturnFromSupport({
    orderId: req.params.orderId,
    conversationId: req.body.conversationId,
    adminUserId: req.dbUser.id,
    note: req.body.note,
  });
  res.json({ success: true, data: { order } });
}

export async function postAdminWorkspaceRejectReturn(req, res) {
  const result = await rejectReturnFromSupport({
    orderId: req.params.orderId,
    conversationId: req.body.conversationId,
    adminUserId: req.dbUser.id,
    note: req.body.note,
  });
  res.json({ success: true, data: result });
}

export async function postAdminWorkspaceReship(req, res) {
  const order = await reshipOrderFromSupport({
    orderId: req.params.orderId,
    conversationId: req.body.conversationId,
    adminUserId: req.dbUser.id,
    trackingNumber: req.body.trackingNumber,
    courier: req.body.courier,
  });
  res.json({ success: true, data: { order } });
}

export async function patchAdminConversationCustomerContact(req, res) {
  const customer = await updateCustomerContactByConversation({
    conversationId: req.params.id,
    adminUserId: req.dbUser.id,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
  });
  res.json({ success: true, data: { customer } });
}

export async function patchAdminWorkspaceCustomerContact(req, res) {
  const customer = await updateCustomerContactFromSupport({
    userId: req.params.id,
    conversationId: req.body.conversationId,
    adminUserId: req.dbUser.id,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
  });
  res.json({ success: true, data: { customer } });
}

export default {
  getAdminSupportWorkspace,
  postAdminInternalNote,
  patchAdminConversationPriority,
  postAdminEscalateTicket,
  patchAdminWorkspaceAssign,
  patchAdminWorkspaceStatus,
  patchAdminWorkspaceShippingAddress,
  postAdminWorkspaceCancelOrder,
  postAdminWorkspaceRefund,
  postAdminWorkspaceApproveReturn,
  postAdminWorkspaceRejectReturn,
  postAdminWorkspaceReship,
  patchAdminConversationCustomerContact,
  patchAdminWorkspaceCustomerContact,
};
