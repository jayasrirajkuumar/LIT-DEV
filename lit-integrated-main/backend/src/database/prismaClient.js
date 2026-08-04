import { PrismaClient } from "@prisma/client";
import config from "../config/env.js";
import { logger } from "../utils/logger.js";
import { registerPrismaClient, initDatabaseHost } from "./connectionManager.js";

const globalForPrisma = globalThis;

function ensureAzureSsl(url) {
  if (!url) return url;
  const isAzureHost = url.includes(".postgres.database.azure.com");
  if (!isAzureHost) return url;
  if (/[?&]sslmode=/.test(url)) return url;
  const separator = url.includes("?") ? "&" : "?";
  logger.warn("DATABASE_URL missing sslmode — appending sslmode=require for Azure PostgreSQL");
  return `${url}${separator}sslmode=require`;
}

function withPoolSettings(url) {
  const normalized = ensureAzureSsl(url);
  if (!normalized) return normalized;
  const separator = normalized.includes("?") ? "&" : "?";
  const parts = [];
  if (!/[?&]connection_limit=/.test(normalized)) parts.push("connection_limit=5");
  if (!/[?&]pool_timeout=/.test(normalized)) parts.push("pool_timeout=15");
  if (!/[?&]connect_timeout=/.test(normalized)) parts.push("connect_timeout=10");
  if (!parts.length) return normalized;
  return `${normalized}${separator}${parts.join("&")}`;
}

function createPrismaClient(url = config.databaseUrl) {
  const datasourceUrl = withPoolSettings(url);
  initDatabaseHost(datasourceUrl);

  return new PrismaClient({
    datasources: { db: { url: datasourceUrl } },
    log: ["warn", "error"],
  });
}

export function recreatePrismaClient(url) {
  if (globalForPrisma.prisma) {
    void globalForPrisma.prisma.$disconnect().catch(() => {});
  }
  const client = createPrismaClient(url);
  globalForPrisma.prisma = client;
  registerPrismaClient(client);
  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (config.nodeEnv !== "production") {
  globalForPrisma.prisma = prisma;
}

registerPrismaClient(prisma);

export async function connectDatabase() {
  const { connectDatabaseWithRetry } = await import("./connectionManager.js");
  const result = await connectDatabaseWithRetry({ client: prisma, maxAttempts: 5, delayMs: 2000, required: false });
  if (result.connected) {
    logger.info("Connected to PostgreSQL", { host: config.databaseHost });
  } else {
    logger.error("Initial PostgreSQL connection failed", {
      host: config.databaseHost,
      message: result.error?.message,
    });
  }
  return result;
}

export async function disconnectDatabase() {
  const { stopDatabaseReconnectLoop } = await import("./connectionManager.js");
  stopDatabaseReconnectLoop();
  await prisma.$disconnect();
  logger.info("Disconnected from PostgreSQL");
}

export default prisma;
