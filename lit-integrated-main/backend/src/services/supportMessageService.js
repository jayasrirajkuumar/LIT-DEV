import { prisma } from "../database/prismaClient.js";
import { AppError } from "../utils/AppError.js";
import { sanitizeSupportText } from "../utils/supportHelpers.js";
import { adminNotificationService } from "./adminNotificationService.js";
import { emailService } from "./emailService.js";
import { logger } from "../utils/logger.js";
import { getSupportSocketHub } from "./supportSocketHub.js";

const DUPLICATE_MESSAGE_WINDOW_MS = 30 * 1000;
const STALE_CONVERSATION_EMAIL_MS = 24 * 60 * 60 * 1000;

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function mapMessage(message) {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderType: message.senderType,
    senderId: message.senderId,
    message: message.message,
    attachmentUrl: message.attachmentUrl,
    attachmentType: message.attachmentType,
    isRead: message.isRead,
    sender: message.sender
      ? {
          id: message.sender.id,
          displayName: message.sender.displayName,
          email: message.sender.email,
        }
      : null,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
  };
}

function deriveStatusAfterMessage(senderType, currentStatus) {
  if (currentStatus === "RESOLVED" || currentStatus === "CLOSED") {
    return senderType === "ADMIN" ? "WAITING_FOR_CUSTOMER" : "WAITING_FOR_SUPPORT";
  }
  return senderType === "ADMIN" ? "WAITING_FOR_CUSTOMER" : "WAITING_FOR_SUPPORT";
}

async function assertConversationAccess(conversationId, user, { admin = false } = {}) {
  const conversation = await prisma.supportRequest.findUnique({
    where: { id: conversationId },
    include: {
      user: { select: { id: true, email: true, displayName: true } },
      assignedTo: { select: { id: true, email: true, displayName: true } },
    },
  });

  if (!conversation) {
    throw new AppError("Conversation not found.", 404, "NOT_FOUND");
  }

  if (admin) {
    if (user.role !== "ADMIN") {
      throw new AppError("Admin access required.", 403, "FORBIDDEN");
    }
    return conversation;
  }

  const ownsByUserId = conversation.userId && conversation.userId === user.id;
  const ownsByEmail = conversation.contactEmail.toLowerCase() === user.email.toLowerCase();

  if (!ownsByUserId && !ownsByEmail) {
    throw new AppError("You do not have access to this conversation.", 403, "FORBIDDEN");
  }

  return conversation;
}

async function assertNoDuplicateMessage({ conversationId, senderType, message }) {
  const since = new Date(Date.now() - DUPLICATE_MESSAGE_WINDOW_MS);
  const duplicate = await prisma.supportMessage.findFirst({
    where: {
      conversationId,
      senderType,
      message,
      createdAt: { gte: since },
    },
    select: { id: true },
  });

  if (duplicate) {
    throw new AppError("Duplicate message detected. Please wait a moment.", 429, "DUPLICATE_MESSAGE");
  }
}

export async function mapConversationSummary(conversation, viewer) {
  const unreadWhere =
    viewer.role === "ADMIN"
      ? { conversationId: conversation.id, senderType: "CUSTOMER", isRead: false }
      : { conversationId: conversation.id, senderType: "ADMIN", isRead: false };

  const unreadCount = await prisma.supportMessage.count({ where: unreadWhere });

  return {
    id: conversation.id,
    ticketNumber: conversation.ticketNumber,
    subject: conversation.subject,
    category: conversation.category,
    status: conversation.status,
    priority: conversation.priority,
    contactName: conversation.contactName,
    contactEmail: conversation.contactEmail,
    lastMessageAt: conversation.lastMessageAt?.toISOString() ?? conversation.createdAt.toISOString(),
    lastMessagePreview: conversation.lastMessagePreview ?? conversation.message,
    unreadCount,
    assignedTo: conversation.assignedTo
      ? {
          id: conversation.assignedTo.id,
          displayName: conversation.assignedTo.displayName,
          email: conversation.assignedTo.email,
        }
      : null,
    user: conversation.user
      ? {
          id: conversation.user.id,
          displayName: conversation.user.displayName,
          email: conversation.user.email,
        }
      : null,
    orderId: conversation.orderId ?? null,
    orderNumber: conversation.order?.orderNumber ?? null,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
  };
}

export async function listConversationMessages(conversationId, user, { admin = false, limit = 100 } = {}) {
  await assertConversationAccess(conversationId, user, { admin });

  const messages = await prisma.supportMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: Math.min(limit, 200),
    include: {
      sender: { select: { id: true, displayName: true, email: true } },
    },
  });

  return messages.map(mapMessage);
}

export async function markConversationRead(conversationId, user, { admin = false } = {}) {
  const conversation = await assertConversationAccess(conversationId, user, { admin });

  const senderTypeToMark = admin ? "CUSTOMER" : "ADMIN";

  await prisma.supportMessage.updateMany({
    where: { conversationId, senderType: senderTypeToMark, isRead: false },
    data: { isRead: true },
  });

  if (!admin) {
    await prisma.supportRequest.update({
      where: { id: conversationId },
      data: { customerLastOpenedAt: new Date() },
    });
  }

  getSupportSocketHub()?.emitConversationRead({
    conversationId,
    readerType: admin ? "ADMIN" : "CUSTOMER",
    readerId: user.id,
  });

  return { conversationId, markedRead: true };
}

async function maybeSendStaleCustomerEmail(conversation, messageText) {
  const lastOpened = conversation.customerLastOpenedAt ?? conversation.createdAt;
  const staleMs = Date.now() - new Date(lastOpened).getTime();

  if (staleMs < STALE_CONVERSATION_EMAIL_MS) return;

  try {
    await emailService.sendMail({
      to: conversation.contactEmail,
      subject: `New reply on support ticket ${conversation.ticketNumber}`,
      text: [
        `Hello ${conversation.contactName},`,
        "",
        "You have a new reply from Luxury In Taste Support:",
        "",
        messageText,
        "",
        `Sign in to view the full conversation: ${conversation.ticketNumber}`,
        "",
        "Luxury In Taste Support",
      ].join("\n"),
    });
  } catch (error) {
    logger.warn("Stale conversation email failed", {
      ticketNumber: conversation.ticketNumber,
      message: error.message,
    });
  }
}

export async function sendConversationMessage({
  conversationId,
  user,
  admin = false,
  message,
  attachmentUrl = null,
  attachmentType = null,
  sendEmail = false,
}) {
  const conversation = await assertConversationAccess(conversationId, user, { admin });
  const senderType = admin ? "ADMIN" : "CUSTOMER";
  const cleanedMessage = sanitizeSupportText(message, 5000);

  if (!cleanedMessage && !attachmentUrl) {
    throw new AppError("Message or attachment is required.", 400, "VALIDATION_ERROR");
  }

  await assertNoDuplicateMessage({
    conversationId,
    senderType,
    message: cleanedMessage || `[${attachmentType || "attachment"}]`,
  });

  const nextStatus = deriveStatusAfterMessage(senderType, conversation.status);
  const preview = cleanedMessage || `[${attachmentType || "attachment"}]`;

  const created = await prisma.$transaction(async (tx) => {
    const chatMessage = await tx.supportMessage.create({
      data: {
        conversationId,
        senderType,
        senderId: user.id,
        message: cleanedMessage || preview,
        attachmentUrl,
        attachmentType,
        isRead: false,
      },
      include: {
        sender: { select: { id: true, displayName: true, email: true } },
      },
    });

    await tx.supportRequest.update({
      where: { id: conversationId },
      data: {
        status: nextStatus,
        lastMessageAt: chatMessage.createdAt,
        lastMessagePreview: preview.slice(0, 500),
        message: conversation.message,
      },
    });

    return chatMessage;
  });

  const payload = mapMessage(created);
  const summary = await mapConversationSummary(
    await prisma.supportRequest.findUnique({
      where: { id: conversationId },
      include: {
        user: { select: { id: true, displayName: true, email: true } },
        assignedTo: { select: { id: true, displayName: true, email: true } },
      },
    }),
    user,
  );

  getSupportSocketHub()?.emitNewMessage({
    conversationId,
    message: payload,
    conversation: summary,
  });

  if (admin) {
    if (sendEmail) {
      await emailService.sendMail({
        to: conversation.contactEmail,
        subject: `Reply on ticket ${conversation.ticketNumber}`,
        text: cleanedMessage || "Please see the attached file in your Support Center.",
        replyTo: conversation.contactEmail,
      });
    } else {
      await maybeSendStaleCustomerEmail(conversation, cleanedMessage || preview);
    }
  } else {
    try {
      await adminNotificationService.notifySupportRequest({
        requestId: conversation.id,
        ticketNumber: conversation.ticketNumber,
        contactName: conversation.contactName,
        contactEmail: conversation.contactEmail,
        type: "CHAT",
      });
    } catch {
      // non-blocking
    }
  }

  return { message: payload, conversation: summary };
}

export async function listUserConversations(userId, userEmail) {
  const conversations = await prisma.supportRequest.findMany({
    where: {
      OR: [{ userId }, { contactEmail: userEmail.toLowerCase() }],
    },
    orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
    take: 50,
    include: {
      user: { select: { id: true, displayName: true, email: true } },
      assignedTo: { select: { id: true, displayName: true, email: true } },
      order: { select: { id: true, orderNumber: true } },
    },
  });

  const user = { id: userId, role: "CUSTOMER", email: userEmail };
  return Promise.all(conversations.map((c) => mapConversationSummary(c, user)));
}

export async function listAdminConversations(filters = {}) {
  const where = {};

  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.assignedToId) where.assignedToId = filters.assignedToId;

  if (filters.search) {
    const term = String(filters.search).trim();
    if (term) {
      where.OR = [
        { ticketNumber: { contains: term, mode: "insensitive" } },
        { contactName: { contains: term, mode: "insensitive" } },
        { contactEmail: { contains: term, mode: "insensitive" } },
        { subject: { contains: term, mode: "insensitive" } },
        { lastMessagePreview: { contains: term, mode: "insensitive" } },
        { order: { orderNumber: { contains: term, mode: "insensitive" } } },
      ];
    }
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) {
      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  const conversations = await prisma.supportRequest.findMany({
    where,
    orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
    take: Math.min(Number(filters.limit) || 100, 200),
    include: {
      user: { select: { id: true, displayName: true, email: true } },
      assignedTo: { select: { id: true, displayName: true, email: true } },
      order: { select: { id: true, orderNumber: true } },
    },
  });

  const adminViewer = { role: "ADMIN" };
  return Promise.all(conversations.map((c) => mapConversationSummary(c, adminViewer)));
}

export async function getSupportChatStats() {
  const todayStart = startOfDay();
  const [
    openConversations,
    waitingForCustomer,
    waitingForAdmin,
    resolvedToday,
    unreadMessages,
    responseSamples,
    latestConversations,
  ] = await Promise.all([
    prisma.supportRequest.count({
      where: { status: { in: ["OPEN", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "WAITING_FOR_SUPPORT"] } },
    }),
    prisma.supportRequest.count({ where: { status: "WAITING_FOR_CUSTOMER" } }),
    prisma.supportRequest.count({
      where: { status: { in: ["WAITING_FOR_SUPPORT", "IN_PROGRESS", "OPEN"] } },
    }),
    prisma.supportRequest.count({
      where: { status: "RESOLVED", updatedAt: { gte: todayStart } },
    }),
    prisma.supportMessage.count({ where: { senderType: "CUSTOMER", isRead: false } }),
    prisma.supportMessage.findMany({
      where: { senderType: "ADMIN" },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { conversationId: true, createdAt: true },
    }),
    prisma.supportRequest.findMany({
      orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
      take: 5,
      select: {
        id: true,
        ticketNumber: true,
        subject: true,
        status: true,
        priority: true,
        contactName: true,
        contactEmail: true,
        lastMessagePreview: true,
        lastMessageAt: true,
        createdAt: true,
      },
    }),
  ]);

  const customerMessages = await prisma.supportMessage.findMany({
    where: { senderType: "CUSTOMER" },
    orderBy: { createdAt: "asc" },
    select: { conversationId: true, createdAt: true },
  });

  const customerIndex = new Map();
  customerMessages.forEach((msg) => {
    if (!customerIndex.has(msg.conversationId)) {
      customerIndex.set(msg.conversationId, []);
    }
    customerIndex.get(msg.conversationId).push(msg.createdAt);
  });

  const deltas = [];
  responseSamples.forEach((adminMsg) => {
    const customerTimes = customerIndex.get(adminMsg.conversationId) ?? [];
    const prior = customerTimes.filter((t) => t < adminMsg.createdAt).pop();
    if (prior) {
      deltas.push(adminMsg.createdAt.getTime() - prior.getTime());
    }
  });

  const averageResponseTimeMs =
    deltas.length > 0 ? Math.round(deltas.reduce((a, b) => a + b, 0) / deltas.length) : 0;

  const formattedLatest = latestConversations.map((c) => ({
    ...c,
    lastMessageAt: c.lastMessageAt?.toISOString() ?? c.createdAt.toISOString(),
    createdAt: c.createdAt.toISOString(),
  }));

  return {
    openConversations,
    waitingForCustomer,
    waitingForAdmin,
    resolvedToday,
    unreadMessages,
    totalTickets: await prisma.supportRequest.count(),
    averageResponseTimeMs,
    averageResponseTimeMinutes: Math.round(averageResponseTimeMs / 60000),
    latestTickets: formattedLatest,
    latestConversations: formattedLatest,
    openTickets: openConversations,
    inProgress: waitingForAdmin,
  };
}

export default {
  listConversationMessages,
  markConversationRead,
  sendConversationMessage,
  listUserConversations,
  listAdminConversations,
  mapConversationSummary,
  getSupportChatStats,
};
