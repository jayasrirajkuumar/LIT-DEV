import { prisma } from "../database/prismaClient.js";
import { AppError } from "../utils/AppError.js";
import { getAdminOrder } from "./adminOrderService.js";
import { getCustomerInsights, ensureConversationUserLinked } from "./supportOrderActionsService.js";
import { createUserNotification } from "./customerNotificationService.js";
import { getSupportTier, hasSupportPermission } from "../middleware/supportPermissions.js";
import { assignSupportRequest, updateSupportRequestStatus } from "./supportService.js";
import { logSupportActivity } from "./supportActivityService.js";

function mapInternalNote(note) {
  return {
    id: note.id,
    note: note.note,
    admin: note.adminUser
      ? { id: note.adminUser.id, displayName: note.adminUser.displayName, email: note.adminUser.email }
      : null,
    createdAt: note.createdAt.toISOString(),
  };
}

function buildTimeline({ conversation, order, messages, activityLogs, internalNotes }) {
  const events = [];

  if (order) {
    events.push({
      type: "ORDER_CREATED",
      label: "Order Created",
      at: order.createdAt,
      meta: { orderNumber: order.orderNumber },
    });

    (order.statusHistory ?? []).forEach((entry) => {
      events.push({
        type: `ORDER_${entry.status}`,
        label: entry.statusLabel || entry.status,
        at: entry.createdAt,
        meta: { note: entry.note },
      });
    });

    if (order.paymentStatus === "CAPTURED") {
      events.push({
        type: "PAYMENT_COMPLETED",
        label: "Payment Completed",
        at: order.updatedAt,
        meta: { paymentMethod: order.paymentMethod },
      });
    }
  }

  events.push({
    type: "TICKET_OPENED",
    label: "Support Ticket Opened",
    at: conversation.createdAt.toISOString(),
    meta: { ticketNumber: conversation.ticketNumber },
  });

  messages.forEach((msg) => {
    events.push({
      type: msg.senderType === "ADMIN" ? "ADMIN_REPLIED" : "CUSTOMER_MESSAGE",
      label: msg.senderType === "ADMIN" ? "Admin Replied" : "Customer Message",
      at: msg.createdAt,
      meta: { preview: msg.message?.slice(0, 120) },
    });
  });

  activityLogs.forEach((log) => {
    events.push({
      type: log.action,
      label: log.message,
      at: log.createdAt,
      meta: { admin: log.admin?.displayName },
    });
  });

  internalNotes.forEach((note) => {
    events.push({
      type: "INTERNAL_NOTE",
      label: "Internal Note Added",
      at: note.createdAt,
      meta: { admin: note.admin?.displayName, preview: note.note?.slice(0, 80) },
      internal: true,
    });
  });

  return events
    .sort((a, b) => new Date(a.at) - new Date(b.at))
    .map((event, index) => ({ id: `${event.type}-${index}`, ...event }));
}

export async function getSupportWorkspace(conversationId, adminUser) {
  const conversation = await prisma.supportRequest.findUnique({
    where: { id: conversationId },
    include: {
      user: { select: { id: true, displayName: true, email: true, phoneNumber: true, createdAt: true } },
      assignedTo: { select: { id: true, displayName: true, email: true } },
      order: { select: { id: true, orderNumber: true } },
    },
  });

  if (!conversation) {
    throw new AppError("Conversation not found.", 404, "NOT_FOUND");
  }

  const linkedUserId = await ensureConversationUserLinked(conversation);
  const effectiveUserId = linkedUserId || conversation.userId;

  const [messages, activityLogs, internalNotes, customer] = await Promise.all([
    prisma.supportMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { id: true, displayName: true, email: true } } },
    }),
    prisma.supportActivityLog.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { adminUser: { select: { id: true, displayName: true, email: true } } },
    }),
    prisma.supportInternalNote.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { adminUser: { select: { id: true, displayName: true, email: true } } },
    }),
    getCustomerInsights(effectiveUserId, conversation.contactEmail),
  ]);

  let order = null;
  let orderLinkSource = null;
  if (conversation.orderId) {
    order = await getAdminOrder(conversation.orderId);
    orderLinkSource = "ticket";
  } else if (customer?.id) {
    const latestOrder = await prisma.order.findFirst({
      where: { userId: customer.id },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    if (latestOrder) {
      order = await getAdminOrder(latestOrder.id);
      orderLinkSource = "latest_customer_order";
    }
  }

  const mappedMessages = messages.map((m) => ({
    id: m.id,
    conversationId: m.conversationId,
    senderType: m.senderType,
    senderId: m.senderId,
    message: m.message,
    attachmentUrl: m.attachmentUrl,
    attachmentType: m.attachmentType,
    isRead: m.isRead,
    sender: m.sender,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  }));

  const mappedActivity = activityLogs.map((log) => ({
    id: log.id,
    action: log.action,
    message: log.message,
    metadata: log.metadata,
    admin: log.adminUser
      ? { id: log.adminUser.id, displayName: log.adminUser.displayName, email: log.adminUser.email }
      : null,
    createdAt: log.createdAt.toISOString(),
  }));

  const mappedNotes = internalNotes.map((n) =>
    mapInternalNote({ ...n, adminUser: n.adminUser }),
  );

  const timeline = buildTimeline({
    conversation: {
      ticketNumber: conversation.ticketNumber,
      createdAt: conversation.createdAt.toISOString(),
    },
    order,
    messages: mappedMessages,
    activityLogs: mappedActivity,
    internalNotes: mappedNotes,
  });

  const permissions = {
    tier: getSupportTier(adminUser),
    canRefund: hasSupportPermission(adminUser, "refund"),
    canCancel: hasSupportPermission(adminUser, "cancel"),
    canEditAddress: hasSupportPermission(adminUser, "address"),
    canAssign: hasSupportPermission(adminUser, "assign"),
    canManageReturns: hasSupportPermission(adminUser, "return"),
    canReship: hasSupportPermission(adminUser, "reship"),
    canUpdateCustomer: hasSupportPermission(adminUser, "customer_update"),
  };

  return {
    conversation: {
      id: conversation.id,
      ticketNumber: conversation.ticketNumber,
      subject: conversation.subject,
      category: conversation.category,
      status: conversation.status,
      priority: conversation.priority,
      contactName: conversation.contactName,
      contactEmail: conversation.contactEmail,
      orderId: conversation.orderId,
      orderNumber: conversation.order?.orderNumber ?? null,
      userId: effectiveUserId,
      assignedTo: conversation.assignedTo,
      user: conversation.user,
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
    },
    customer: {
      ...customer,
      accountLinked: Boolean(customer?.id),
    },
    order,
    orderLinkSource,
    timeline,
    activityLog: mappedActivity,
    internalNotes: mappedNotes,
    permissions,
  };
}

export async function addInternalNote(conversationId, adminUserId, note) {
  const cleaned = String(note || "").trim();
  if (!cleaned) {
    throw new AppError("Note is required.", 400, "VALIDATION_ERROR");
  }

  const created = await prisma.supportInternalNote.create({
    data: {
      conversationId,
      adminUserId,
      note: cleaned.slice(0, 5000),
    },
    include: { adminUser: { select: { id: true, displayName: true, email: true } } },
  });

  await logSupportActivity({
    conversationId,
    adminUserId,
    action: "INTERNAL_NOTE",
    message: "Internal note added",
    metadata: { noteId: created.id },
  });

  return mapInternalNote(created);
}

export async function updateConversationPriority(conversationId, adminUserId, priority) {
  const valid = ["LOW", "MEDIUM", "HIGH"];
  if (!valid.includes(priority)) {
    throw new AppError("Invalid priority.", 400, "VALIDATION_ERROR");
  }

  const updated = await prisma.supportRequest.update({
    where: { id: conversationId },
    data: { priority },
  });

  await logSupportActivity({
    conversationId,
    adminUserId,
    action: "PRIORITY_CHANGED",
    message: `Priority set to ${priority}`,
    metadata: { priority },
  });

  return { id: updated.id, priority: updated.priority };
}

export async function escalateConversation(conversationId, adminUserId) {
  const updated = await prisma.supportRequest.update({
    where: { id: conversationId },
    data: { priority: "HIGH", status: "WAITING_FOR_SUPPORT" },
  });

  await logSupportActivity({
    conversationId,
    adminUserId,
    action: "ESCALATED",
    message: "Ticket escalated to high priority",
  });

  if (updated.userId) {
    await createUserNotification({
      userId: updated.userId,
      type: "TICKET_ESCALATED",
      title: "Ticket escalated",
      message: `Your support ticket ${updated.ticketNumber} has been escalated for faster resolution.`,
      entityType: "support",
      entityId: updated.id,
    });
  }

  return { id: updated.id, priority: updated.priority, status: updated.status };
}

export async function workspaceAssignTicket(conversationId, adminUserId, assignedToId) {
  const result = await assignSupportRequest(conversationId, assignedToId || null);

  await logSupportActivity({
    conversationId,
    adminUserId,
    action: "TICKET_ASSIGNED",
    message: assignedToId ? "Ticket assigned" : "Ticket unassigned",
    metadata: { assignedToId },
  });

  return result;
}

export async function workspaceUpdateStatus(conversationId, adminUserId, status) {
  const result = await updateSupportRequestStatus(conversationId, status);

  await logSupportActivity({
    conversationId,
    adminUserId,
    action: "STATUS_CHANGED",
    message: `Status changed to ${status}`,
    metadata: { status },
  });

  const conversation = await prisma.supportRequest.findUnique({
    where: { id: conversationId },
    select: { userId: true, ticketNumber: true },
  });

  if (conversation?.userId && (status === "RESOLVED" || status === "CLOSED")) {
    await createUserNotification({
      userId: conversation.userId,
      type: "TICKET_RESOLVED",
      title: status === "CLOSED" ? "Ticket closed" : "Ticket resolved",
      message: `Your support ticket ${conversation.ticketNumber} has been ${status.toLowerCase().replace(/_/g, " ")}.`,
      entityType: "support",
      entityId: conversationId,
    });
  }

  return result;
}

export default {
  getSupportWorkspace,
  addInternalNote,
  updateConversationPriority,
  escalateConversation,
  workspaceAssignTicket,
  workspaceUpdateStatus,
};
