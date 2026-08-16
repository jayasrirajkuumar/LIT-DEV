import http from "http";
import app from "./src/app.js";
import config from "./src/config/env.js";
import { connectDatabase, disconnectDatabase } from "./src/database/prismaClient.js";
import { startDatabaseReconnectLoop, stopDatabaseReconnectLoop } from "./src/database/connectionManager.js";
import { databaseState } from "./src/database/connectionState.js";
import { logger } from "./src/utils/logger.js";
import { startupOk, startupFail, startupWarn } from "./src/utils/startupLog.js";
import { freePort } from "./src/utils/freePort.js";
import { startGiftCardScheduler } from "./src/services/giftCardScheduler.js";
import { initSupportSocket } from "./src/services/supportSocket.js";

function listen(server, port) {
  return new Promise((resolve, reject) => {
    const onError = (err) => {
      server.off("listening", onListening);
      reject(err);
    };
    const onListening = () => {
      server.off("error", onError);
      resolve();
    };
    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(port);
  });
}

async function bindServer(server, port) {
  const maxAttempts = config.isProduction ? 1 : 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await listen(server, port);
      return;
    } catch (error) {
      if (error.code !== "EADDRINUSE" || attempt === maxAttempts) {
        throw error;
      }
      logger.warn(`Port ${port} busy on attempt ${attempt}, retrying...`);
      freePort(port);
      await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
    }
  }
}

async function startServer() {
  startupOk("Environment loaded", `NODE_ENV=${config.nodeEnv}`);
  startupOk("Prisma initialized", `host=${config.databaseHost}`);

  const dbResult = await connectDatabase();

  if (dbResult.connected) {
    startupOk("Database connected", config.databaseHost);
  } else {
    const reason = dbResult.error?.message ?? "Unable to reach PostgreSQL";
    startupFail("Database connected", reason);

    if (config.databaseHost?.includes(".postgres.database.azure.com")) {
      startupWarn(
        "Azure PostgreSQL",
        "Check VPN, firewall rules, and that your IP is allowed in Azure Portal",
      );
    }

    startupWarn(
      "Degraded mode",
      "API will return 503 for database routes until Azure PostgreSQL is reachable",
    );
    startDatabaseReconnectLoop();
  }

  startupOk("Gift card routes registered", "/api/gift-cards/*");

  const server = http.createServer(app);
  server.requestTimeout = 30_000;
  server.headersTimeout = 35_000;
  const io = initSupportSocket(server);
  const stopGiftCardScheduler = startGiftCardScheduler();

  await bindServer(server, config.port);

  startupOk("Server running", `http://localhost:${config.port}`);
  logger.info(`LIT API listening on port ${config.port}`, {
    environment: config.nodeEnv,
    database: databaseState.connected ? "connected" : "disconnected",
  });

  let shuttingDown = false;
  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    stopGiftCardScheduler?.();
    stopDatabaseReconnectLoop();
    await new Promise((resolve) => io.close(() => resolve()));
    await new Promise((resolve) => server.close(() => resolve()));
    await disconnectDatabase();
    process.exit(0);
  };

  process.on("SIGINT", () => {
    shutdown("SIGINT").catch((error) => {
      logger.error("Shutdown failed", { message: error.message });
      process.exit(1);
    });
  });
  process.on("SIGTERM", () => {
    shutdown("SIGTERM").catch((error) => {
      logger.error("Shutdown failed", { message: error.message });
      process.exit(1);
    });
  });
}

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", {
    message: error.message,
    stack: error.stack,
  });
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", {
    message: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  });
});

startServer().catch((error) => {
  startupFail("Server startup", error.message);
  logger.error("Failed to start server", { message: error.message, stack: error.stack });
  process.exit(1);
});
