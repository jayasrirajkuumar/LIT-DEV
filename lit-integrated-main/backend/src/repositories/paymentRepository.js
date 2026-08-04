import { prisma } from "../database/prismaClient.js";
import { toPublicPaymentIntent } from "../utils/orderMappers.js";

export const paymentRepository = {
  async createIntent(data, tx = prisma) {
    const intent = await tx.paymentIntent.create({
      data,
      include: { transactions: true },
    });
    return toPublicPaymentIntent(intent);
  },

  async createTransaction(data, tx = prisma) {
    return tx.paymentTransaction.create({ data });
  },

  async updateIntent(intentId, data, tx = prisma) {
    const intent = await tx.paymentIntent.update({
      where: { id: intentId },
      data,
      include: { transactions: { orderBy: { createdAt: "desc" } } },
    });
    return toPublicPaymentIntent(intent);
  },

  async findIntentByOrderId(orderId) {
    const intent = await prisma.paymentIntent.findFirst({
      where: { orderId },
      include: { transactions: { orderBy: { createdAt: "desc" } } },
      orderBy: { createdAt: "desc" },
    });
    return intent ? toPublicPaymentIntent(intent) : null;
  },
};

export default paymentRepository;
