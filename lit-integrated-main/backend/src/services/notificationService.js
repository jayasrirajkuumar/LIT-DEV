import { logger } from "../utils/logger.js";

export const notificationService = {
  async orderPlaced({ userId, orderId, orderNumber, email }) {
    logger.info("Notification placeholder: order placed", { userId, orderId, orderNumber, email });
    return { queued: true, channel: "email", template: "order_placed" };
  },

  async paymentSuccess({ userId, orderId, orderNumber, amount, email }) {
    logger.info("Notification placeholder: payment success", {
      userId,
      orderId,
      orderNumber,
      amount,
      email,
    });
    return { queued: true, channel: "email", template: "payment_success" };
  },

  async orderShipped({ userId, orderId, orderNumber, trackingNumber, email }) {
    logger.info("Notification placeholder: order shipped", {
      userId,
      orderId,
      orderNumber,
      trackingNumber,
      email,
    });
    return { queued: true, channel: "email", template: "order_shipped" };
  },

  async orderDelivered({ userId, orderId, orderNumber, email }) {
    logger.info("Notification placeholder: order delivered", {
      userId,
      orderId,
      orderNumber,
      email,
    });
    return { queued: true, channel: "email", template: "order_delivered" };
  },
};

export default notificationService;
