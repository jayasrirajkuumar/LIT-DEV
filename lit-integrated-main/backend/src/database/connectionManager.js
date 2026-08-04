import {
  databaseState,
  markDatabaseConnected,
  markDatabaseDisconnected,
  isPrismaConnectionError,
  getDatabaseHostFromUrl,
} from "./connectionState.js";
import { withTimeout } from "../utils/withTimeout.js";

const RECONNECT_INTERVAL_MS = 30_000;
const PING_TIMEOUT_MS = 5_000;
const PING_CACHE_MS = 15_000;
let lastSuccessfulPingAt = 0;

let reconnectTimer = null;
let prismaRef = null;
let reconnectPromise = null;

export function registerPrismaClient(client) {
  prismaRef = client;
}

export async function pingDatabase(client = prismaRef) {
  if (!client) throw new Error("Prisma client is not initialized.");
  await withTimeout(
    client.$queryRaw`SELECT 1`,
    PING_TIMEOUT_MS,
    "Database ping timed out.",
    "DATABASE_TIMEOUT",
  );
  markDatabaseConnected(databaseState.host);
  lastSuccessfulPingAt = Date.now();
  return true;
}

export async function connectDatabaseWithRetry({
  client,
  maxAttempts = 5,
  delayMs = 2000,
  required = false,
} = {}) {
  const prisma = client ?? prismaRef;
  if (!prisma) throw new Error("Prisma client is not initialized.");

  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await withTimeout(prisma.$connect(), PING_TIMEOUT_MS, "Database connect timed out.");
      await pingDatabase(prisma);
      return { connected: true, attempt };
    } catch (error) {
      lastError = error;
      markDatabaseDisconnected(error);
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  if (required) throw lastError ?? new Error("Database connection failed.");
  return { connected: false, error: lastError };
}

export async function reconnectDatabase() {
  if (!prismaRef) return false;
  if (reconnectPromise) return reconnectPromise;

  reconnectPromise = (async () => {
    databaseState.reconnecting = true;
    try {
      try {
        await prismaRef.$disconnect();
      } catch {
        // ignore
      }
      const result = await connectDatabaseWithRetry({ client: prismaRef, maxAttempts: 2, delayMs: 1000 });
      return result.connected;
    } finally {
      databaseState.reconnecting = false;
      reconnectPromise = null;
    }
  })();

  return reconnectPromise;
}

export async function ensureDatabaseReady(client = prismaRef) {
  if (databaseState.connected && Date.now() - lastSuccessfulPingAt < PING_CACHE_MS) {
    return true;
  }

  if (databaseState.reconnecting) {
    await withTimeout(
      reconnectPromise ?? Promise.resolve(false),
      PING_TIMEOUT_MS,
      "Database reconnect in progress.",
      "DATABASE_TIMEOUT",
    ).catch(() => false);
  }

  try {
    await pingDatabase(client);
    return true;
  } catch (error) {
    markDatabaseDisconnected(error);
    return withTimeout(
      reconnectDatabase(),
      12_000,
      "Database reconnect timed out.",
      "DATABASE_TIMEOUT",
    ).catch(() => false);
  }
}

export function startDatabaseReconnectLoop() {
  if (reconnectTimer) return;
  reconnectTimer = setInterval(() => {
    if (databaseState.connected || databaseState.reconnecting) return;
    void reconnectDatabase();
  }, RECONNECT_INTERVAL_MS);
  reconnectTimer.unref?.();
}

export function stopDatabaseReconnectLoop() {
  if (!reconnectTimer) return;
  clearInterval(reconnectTimer);
  reconnectTimer = null;
}

export function initDatabaseHost(url) {
  databaseState.host = getDatabaseHostFromUrl(url);
}

export { isPrismaConnectionError };

export default {
  registerPrismaClient,
  pingDatabase,
  connectDatabaseWithRetry,
  reconnectDatabase,
  ensureDatabaseReady,
  startDatabaseReconnectLoop,
  stopDatabaseReconnectLoop,
  initDatabaseHost,
  isPrismaConnectionError,
};
