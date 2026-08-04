let hub = null;

export function setSupportSocketHub(instance) {
  hub = instance;
}

export function getSupportSocketHub() {
  return hub;
}

export class SupportSocketHub {
  constructor(io) {
    this.io = io;
    this.typingUsers = new Map();
    this.onlineUsers = new Map();
  }

  joinConversation(socket, conversationId) {
    socket.join(`conversation:${conversationId}`);
  }

  joinAdminInbox(socket) {
    socket.join("admin:support");
  }

  joinUserInbox(socket, userId) {
    socket.join(`user:${userId}`);
  }

  setOnline(userId, socketId) {
    this.onlineUsers.set(userId, socketId);
    this.io.emit("support:presence", { userId, online: true });
  }

  setOffline(userId) {
    this.onlineUsers.delete(userId);
    this.io.emit("support:presence", { userId, online: false });
  }

  isOnline(userId) {
    return this.onlineUsers.has(userId);
  }

  emitNewMessage({ conversationId, message, conversation }) {
    this.io.to(`conversation:${conversationId}`).emit("support:message:new", {
      conversationId,
      message,
      conversation,
    });
    this.io.to("admin:support").emit("support:conversation:updated", { conversation });
    if (conversation?.user?.id) {
      this.io.to(`user:${conversation.user.id}`).emit("support:conversation:updated", { conversation });
    }
  }

  emitConversationRead({ conversationId, readerType, readerId }) {
    this.io.to(`conversation:${conversationId}`).emit("support:message:read", {
      conversationId,
      readerType,
      readerId,
    });
  }

  emitTyping({ conversationId, userId, displayName, isTyping }) {
    this.io.to(`conversation:${conversationId}`).emit("support:typing", {
      conversationId,
      userId,
      displayName,
      isTyping,
    });
  }

  emitUserNotification({ userId, notification }) {
    if (!userId || !notification) return;
    this.io.to(`user:${userId}`).emit("notification:new", notification);
    if (notification.type === "GIFT_CARD_RECEIVED" && notification.entityId) {
      this.io.to(`user:${userId}`).emit("gift-card-received", {
        type: notification.type,
        giftCardId: notification.entityId,
        senderName: notification.senderName || notification.title,
        amount: notification.amount ?? null,
        message: notification.message,
        notificationId: notification.id,
      });
    }
  }
}

export default { setSupportSocketHub, getSupportSocketHub, SupportSocketHub };
