import { prisma } from "../database/prismaClient.js";
import { AUDIT_ACTIONS } from "../constants/auditActions.js";

export async function recordAudit({
  adminUserId,
  action,
  entityType = null,
  entityId = null,
  metadata = null,
}) {
  return prisma.adminAuditLog.create({
    data: {
      adminUserId: adminUserId ?? null,
      action,
      entityType,
      entityId: entityId ? String(entityId) : null,
      metadata: metadata ?? undefined,
    },
  });
}

export async function listAuditLogs({ limit = 20, offset = 0 } = {}) {
  const [items, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        admin: { select: { id: true, email: true, displayName: true } },
      },
    }),
    prisma.adminAuditLog.count(),
  ]);

  return {
    items: items.map((entry) => ({
      id: entry.id,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      metadata: entry.metadata,
      createdAt: entry.createdAt.toISOString(),
      admin: entry.admin
        ? {
            id: entry.admin.id,
            email: entry.admin.email,
            displayName: entry.admin.displayName,
          }
        : null,
    })),
    pagination: { limit, offset, total },
  };
}

export async function logAdminAccess(adminUserId) {
  return recordAudit({
    adminUserId,
    action: AUDIT_ACTIONS.ADMIN_ACCESS,
    entityType: "admin",
    metadata: { source: "dashboard" },
  });
}

export const auditLogService = {
  record: recordAudit,
  list: listAuditLogs,
  logAdminAccess,
};

export default auditLogService;
