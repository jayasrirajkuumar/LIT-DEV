import { Server } from "socket.io";
import config from "../config/env.js";
import { validateAzureIdToken } from "../config/azureAuth.js";
import { userRepository } from "../repositories/userRepository.js";
import { logger } from "../utils/logger.js";
import {
  SupportSocketHub,
  setSupportSocketHub,
} from "./supportSocketHub.js";

export function initSupportSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigins,
      credentials: true,
    },
    path: "/socket.io",
  });

  const hub = new SupportSocketHub(io);
  setSupportSocketHub(hub);

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        next(new Error("Authentication required."));
        return;
      }

      const auth = await validateAzureIdToken(token);
      const user = await userRepository.findByAzureUserId(auth.azureUserId);

      if (!user || !user.isActive) {
        next(new Error("User not found or inactive."));
        return;
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(error);
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;
    hub.setOnline(user.id, socket.id);
    hub.joinUserInbox(socket, user.id);

    if (user.role === "ADMIN") {
      hub.joinAdminInbox(socket);
    }

    socket.on("support:conversation:join", ({ conversationId }) => {
      if (conversationId) hub.joinConversation(socket, conversationId);
    });

    socket.on("support:typing", ({ conversationId, isTyping }) => {
      if (!conversationId) return;
      hub.emitTyping({
        conversationId,
        userId: user.id,
        displayName: user.displayName || user.email,
        isTyping: Boolean(isTyping),
      });
    });

    socket.on("disconnect", () => {
      hub.setOffline(user.id);
    });
  });

  logger.info("Support Socket.IO initialized");
  return io;
}

export default { initSupportSocket };
