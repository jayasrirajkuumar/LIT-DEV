import { prisma } from "../database/prismaClient.js";
import { AppError } from "../utils/AppError.js";
import { adminNotificationService } from "./adminNotificationService.js";
import { emailService } from "./emailService.js";
import { logger } from "../utils/logger.js";
import {
  sanitizeSupportText,
  deriveSubjectFromMessage,
  formatTicketNumber,
  parseTicketSequence,
} from "../utils/supportHelpers.js";

const DUPLICATE_WINDOW_MS = 2 * 60 * 1000;

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function generateTicketNumber() {
  const last = await prisma.supportRequest.findFirst({
    orderBy: { ticketNumber: "desc" },
    select: { ticketNumber: true },
  });
  const next = parseTicketSequence(last?.ticketNumber) + 1;
  return formatTicketNumber(next);
}

function mapSupportRequest(r) {
  return {
    id: r.id,
    ticketNumber: r.ticketNumber,
    type: r.type,
    subject: r.subject,
    category: r.category,
    message: r.message,
    status: r.status,
    priority: r.priority,
    contactName: r.contactName,
    contactEmail: r.contactEmail,
    orderId: r.orderId,
    orderNumber: r.order?.orderNumber ?? null,
    user: r.user
      ? {
          id: r.user.id,
          email: r.user.email,
          displayName: r.user.displayName,
          phoneNumber: r.user.phoneNumber,
        }
      : null,
    assignedTo: r.assignedTo
      ? {
          id: r.assignedTo.id,
          email: r.assignedTo.email,
          displayName: r.assignedTo.displayName,
        }
      : null,
    replies: (r.replies ?? []).map((reply) => ({
      id: reply.id,
      message: reply.message,
      channel: reply.channel,
      admin: reply.adminUser
        ? {
            displayName: reply.adminUser.displayName,
            email: reply.adminUser.email,
          }
        : null,
      createdAt: reply.createdAt.toISOString(),
    })),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

async function assertNoDuplicateSubmission({ contactEmail, subject, message }) {
  const since = new Date(Date.now() - DUPLICATE_WINDOW_MS);
  const duplicate = await prisma.supportRequest.findFirst({
    where: {
      contactEmail: contactEmail.toLowerCase(),
      subject,
      message,
      createdAt: { gte: since },
    },
    select: { id: true, ticketNumber: true },
  });

  if (duplicate) {
    throw new AppError(
      "A similar support request was recently submitted. Please wait before submitting again.",
      429,
      "DUPLICATE_SUBMISSION",
      { ticketNumber: duplicate.ticketNumber },
    );
  }
}

async function queueSupportEmails(ticket, { sendCustomerEmail = false } = {}) {
  const payload = {
    ticketNumber: ticket.ticketNumber,
    contactName: ticket.contactName,
    contactEmail: ticket.contactEmail,
    subject: ticket.subject,
    category: ticket.category,
    message: ticket.message,
    createdAt: ticket.createdAt,
  };

  const tasks = [emailService.sendSupportTeamNotification(payload)];
  if (sendCustomerEmail) {
    tasks.push(emailService.sendCustomerAcknowledgment(payload));
  }

  Promise.allSettled(tasks).then((results) => {
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        logger.error("Support email task rejected", {
          ticketNumber: ticket.ticketNumber,
          task: index === 0 ? "team_notification" : "customer_acknowledgment",
          message: result.reason?.message,
        });
      }
    });
  });
}

async function createConversationWithMessage({
  userId = null,
  orderId = null,
  contactName,
  contactEmail,
  type = "GENERAL",
  subject,
  category = null,
  message,
  priority = "MEDIUM",
}) {
  const cleanedMessage = sanitizeSupportText(message, 5000);
  const cleanedSubject = sanitizeSupportText(
    subject || deriveSubjectFromMessage(cleanedMessage, "Support Request"),
    255,
  );

  if (!cleanedMessage) throw new AppError("Message is required.", 400, "VALIDATION_ERROR");

  const ticketNumber = await generateTicketNumber();
  const now = new Date();

  const request = await prisma.$transaction(async (tx) => {
    const created = await tx.supportRequest.create({
      data: {
        ticketNumber,
        userId,
        orderId,
        contactName,
        contactEmail: contactEmail.toLowerCase(),
        type,
        subject: cleanedSubject,
        category,
        message: cleanedMessage,
        status: "OPEN",
        priority,
        lastMessageAt: now,
        lastMessagePreview: cleanedMessage.slice(0, 500),
        customerLastOpenedAt: now,
      },
    });

    await tx.supportMessage.create({
      data: {
        conversationId: created.id,
        senderType: "CUSTOMER",
        senderId: userId,
        message: cleanedMessage,
        isRead: false,
      },
    });

    return created;
  });

  return request;
}

async function resolveContactFields(userId, payload) {
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, displayName: true },
    });
    if (!user) {
      throw new AppError("User not found.", 404, "USER_NOT_FOUND");
    }
    return {
      contactName: payload.contactName || user.displayName || user.email.split("@")[0],
      contactEmail: (payload.contactEmail || user.email).toLowerCase(),
    };
  }

  return {
    contactName: sanitizeSupportText(payload.name, 255),
    contactEmail: String(payload.email || "").trim().toLowerCase(),
  };
}

export async function createPublicSupportRequest(payload) {
  const contactName = sanitizeSupportText(payload.name, 255);
  const contactEmail = String(payload.email || "").trim().toLowerCase();
  const message = sanitizeSupportText(payload.message, 5000);
  const subject = sanitizeSupportText(
    payload.subject || deriveSubjectFromMessage(message),
    255,
  );
  const category = payload.category ? sanitizeSupportText(payload.category, 100) : null;

  if (!contactName) throw new AppError("Name is required.", 400, "VALIDATION_ERROR");
  if (!contactEmail) throw new AppError("Email is required.", 400, "VALIDATION_ERROR");
  if (!subject) throw new AppError("Subject is required.", 400, "VALIDATION_ERROR");
  if (!message) throw new AppError("Message is required.", 400, "VALIDATION_ERROR");

  await assertNoDuplicateSubmission({ contactEmail, subject, message });

  const request = await createConversationWithMessage({
    contactName,
    contactEmail,
    type: "GENERAL",
    subject,
    category,
    message,
  });

  try {
    await adminNotificationService.notifySupportRequest({
      requestId: request.id,
      ticketNumber: request.ticketNumber,
      contactName: request.contactName,
      contactEmail: request.contactEmail,
      type: request.type,
    });
  } catch (error) {
    logger.warn("Admin notification failed for support request", {
      ticketNumber: request.ticketNumber,
      message: error.message,
    });
  }

  queueSupportEmails(request);

  return mapSupportRequest(request);
}

export async function createSupportRequest(userId, payload) {
  if (payload.orderId) {
    const order = await prisma.order.findFirst({
      where: { id: payload.orderId, userId },
    });
    if (!order) {
      throw new AppError("Order not found.", 404, "ORDER_NOT_FOUND");
    }
  }

  const { contactName, contactEmail } = await resolveContactFields(userId, payload);
  const message = sanitizeSupportText(payload.message, 5000);
  const subject = sanitizeSupportText(
    payload.subject || deriveSubjectFromMessage(message, "Support Request"),
    255,
  );
  const category = payload.category ? sanitizeSupportText(payload.category, 100) : null;

  if (!message) throw new AppError("Message is required.", 400, "VALIDATION_ERROR");

  await assertNoDuplicateSubmission({ contactEmail, subject, message });

  const request = await createConversationWithMessage({
    userId,
    orderId: payload.orderId ?? null,
    contactName,
    contactEmail,
    type: payload.type ?? "GENERAL",
    subject,
    category,
    message,
    priority: payload.priority ?? "MEDIUM",
  });

  try {
    await adminNotificationService.notifySupportRequest({
      requestId: request.id,
      ticketNumber: request.ticketNumber,
      contactName: request.contactName,
      contactEmail: request.contactEmail,
      userId,
      orderId: payload.orderId,
      type: request.type,
    });
  } catch (error) {
    logger.warn("Admin notification failed for support request", {
      ticketNumber: request.ticketNumber,
      message: error.message,
    });
  }

  queueSupportEmails(request);

  return mapSupportRequest(request);
}

export async function listUserSupportRequests(userId) {
  const requests = await prisma.supportRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return requests.map((r) => mapSupportRequest(r));
}

function buildAdminSupportWhere(filters = {}) {
  const where = {};

  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) {
      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  if (filters.search) {
    const term = String(filters.search).trim();
    if (term) {
      where.OR = [
        { ticketNumber: { contains: term, mode: "insensitive" } },
        { contactName: { contains: term, mode: "insensitive" } },
        { contactEmail: { contains: term, mode: "insensitive" } },
        { subject: { contains: term, mode: "insensitive" } },
      ];
    }
  }

  return where;
}

export async function listAdminSupportRequests(filters = {}) {
  const where = buildAdminSupportWhere(filters);

  const requests = await prisma.supportRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: Math.min(Number(filters.limit) || 100, 200),
    include: {
      user: { select: { id: true, email: true, displayName: true, phoneNumber: true } },
      assignedTo: { select: { id: true, email: true, displayName: true } },
      order: { select: { id: true, orderNumber: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: { adminUser: { select: { displayName: true, email: true } } },
      },
    },
  });

  return requests.map((r) => mapSupportRequest(r));
}

export async function getAdminSupportRequest(requestId) {
  const request = await prisma.supportRequest.findUnique({
    where: { id: requestId },
    include: {
      user: { select: { id: true, email: true, displayName: true, phoneNumber: true } },
      assignedTo: { select: { id: true, email: true, displayName: true } },
      order: { select: { id: true, orderNumber: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: { adminUser: { select: { displayName: true, email: true } } },
      },
    },
  });
  if (!request) throw new AppError("Support request not found.", 404, "NOT_FOUND");
  return mapSupportRequest(request);
}

export async function replyToSupportRequest(requestId, adminUserId, payload) {
  const request = await prisma.supportRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new AppError("Support request not found.", 404, "NOT_FOUND");

  const replyMessage = sanitizeSupportText(payload.message, 5000);
  if (!replyMessage) throw new AppError("Reply message is required.", 400, "VALIDATION_ERROR");

  const reply = await prisma.supportRequestReply.create({
    data: {
      supportRequestId: requestId,
      adminUserId,
      message: replyMessage,
      channel: payload.channel ?? "EMAIL",
    },
  });

  const nextStatus = payload.status ?? (request.status === "OPEN" ? "IN_PROGRESS" : request.status);
  await prisma.supportRequest.update({
    where: { id: requestId },
    data: { status: nextStatus },
  });

  return {
    id: reply.id,
    message: reply.message,
    channel: reply.channel,
    status: nextStatus,
    createdAt: reply.createdAt.toISOString(),
  };
}

export async function updateSupportRequestStatus(requestId, status) {
  const existing = await prisma.supportRequest.findUnique({ where: { id: requestId } });
  if (!existing) throw new AppError("Support request not found.", 404, "NOT_FOUND");

  const request = await prisma.supportRequest.update({
    where: { id: requestId },
    data: { status },
  });

  // In-app chat is the primary channel; status emails are not sent automatically.
  return { id: request.id, ticketNumber: request.ticketNumber, status: request.status };
}

export async function assignSupportRequest(requestId, assignedToId) {
  const request = await prisma.supportRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new AppError("Support request not found.", 404, "NOT_FOUND");

  if (assignedToId) {
    const admin = await prisma.user.findFirst({
      where: { id: assignedToId, role: "ADMIN", isActive: true },
    });
    if (!admin) {
      throw new AppError("Admin user not found.", 404, "ADMIN_NOT_FOUND");
    }
  }

  const updated = await prisma.supportRequest.update({
    where: { id: requestId },
    data: { assignedToId: assignedToId || null },
    include: {
      assignedTo: { select: { id: true, email: true, displayName: true } },
    },
  });

  return {
    id: updated.id,
    assignedTo: updated.assignedTo
      ? {
          id: updated.assignedTo.id,
          email: updated.assignedTo.email,
          displayName: updated.assignedTo.displayName,
        }
      : null,
  };
}

export async function deleteSupportRequest(requestId) {
  const request = await prisma.supportRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new AppError("Support request not found.", 404, "NOT_FOUND");

  await prisma.supportRequest.delete({ where: { id: requestId } });
  return { deleted: true, id: requestId };
}

export async function listSupportAdmins() {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", isActive: true },
    orderBy: { displayName: "asc" },
    select: { id: true, email: true, displayName: true },
  });
  return admins;
}

export async function createSupportConversation(userId, payload) {
  if (payload.orderId) {
    const order = await prisma.order.findFirst({
      where: { id: payload.orderId, userId },
    });
    if (!order) {
      throw new AppError("Order not found.", 404, "ORDER_NOT_FOUND");
    }
  }

  const { contactName, contactEmail } = await resolveContactFields(userId, payload);
  const message = sanitizeSupportText(payload.message, 5000);
  const subject = sanitizeSupportText(
    payload.subject || deriveSubjectFromMessage(message, "Support Request"),
    255,
  );
  const category = payload.category ? sanitizeSupportText(payload.category, 100) : null;

  if (!message) throw new AppError("Message is required.", 400, "VALIDATION_ERROR");

  await assertNoDuplicateSubmission({ contactEmail, subject, message });

  const request = await createConversationWithMessage({
    userId,
    orderId: payload.orderId ?? null,
    contactName,
    contactEmail,
    type: payload.type ?? "CHAT",
    subject,
    category,
    message,
    priority: payload.priority ?? "MEDIUM",
  });

  try {
    await adminNotificationService.notifySupportRequest({
      requestId: request.id,
      ticketNumber: request.ticketNumber,
      contactName: request.contactName,
      contactEmail: request.contactEmail,
      userId,
      type: request.type,
    });
  } catch (error) {
    logger.warn("Admin notification failed for support conversation", {
      ticketNumber: request.ticketNumber,
      message: error.message,
    });
  }

  return {
    conversation: mapSupportRequest(request),
    message: "Conversation started successfully.",
  };
}

export async function getSupportDashboardStats() {
  const { getSupportChatStats } = await import("./supportMessageService.js");
  return getSupportChatStats();
}

export default {
  createPublicSupportRequest,
  createSupportRequest,
  createSupportConversation,
  listUserSupportRequests,
  listAdminSupportRequests,
  getAdminSupportRequest,
  replyToSupportRequest,
  updateSupportRequestStatus,
  assignSupportRequest,
  deleteSupportRequest,
  listSupportAdmins,
  getSupportDashboardStats,
};
