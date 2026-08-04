/**
 * Shared database connectivity state for health checks and middleware.
 */
export const databaseState = {
  connected: false,
  lastError: null,
  lastCheckedAt: null,
  host: null,
  reconnecting: false,
};

export function markDatabaseConnected(host = null) {
  databaseState.connected = true;
  databaseState.lastError = null;
  databaseState.lastCheckedAt = new Date().toISOString();
  if (host) databaseState.host = host;
}

export function markDatabaseDisconnected(error) {
  databaseState.connected = false;
  databaseState.lastError = error?.message ?? String(error ?? "Unknown database error");
  databaseState.lastCheckedAt = new Date().toISOString();
}

export function getDatabaseHostFromUrl(url) {
  if (!url) return null;
  const match = url.match(/@([^:/]+)/);
  return match?.[1] ?? null;
}

export function isPrismaConnectionError(error) {
  const code = error?.code;
  const message = String(error?.message ?? "");
  return (
    code === "P1001" ||
    code === "P1002" ||
    code === "P1017" ||
    message.includes("Can't reach database server") ||
    message.includes("ConnectionReset") ||
    message.includes("connection was forcibly closed") ||
    message.includes("ECONNREFUSED") ||
    message.includes("ECONNRESET") ||
    message.includes("ETIMEDOUT")
  );
}

export default databaseState;
