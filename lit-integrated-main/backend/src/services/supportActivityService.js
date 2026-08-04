import { prisma } from "../database/prismaClient.js";

export async function logSupportActivity({
  conversationId,
  adminUserId = null,
  action,
  message,
  metadata = null,
}) {
  const entry = await prisma.supportActivityLog.create({
    data: {
      conversationId,
      adminUserId,
      action,
      message,
      metadata,
    },
    include: {
      adminUser: { select: { id: true, displayName: true, email: true } },
    },
  });

  return {
    id: entry.id,
    action: entry.action,
    message: entry.message,
    metadata: entry.metadata,
    admin: entry.adminUser
      ? { id: entry.adminUser.id, displayName: entry.adminUser.displayName, email: entry.adminUser.email }
      : null,
    createdAt: entry.createdAt.toISOString(),
  };
}

export default { logSupportActivity };
