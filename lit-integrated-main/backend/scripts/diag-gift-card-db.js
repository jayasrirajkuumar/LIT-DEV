import { connectDatabase, disconnectDatabase, prisma } from "../src/database/prismaClient.js";
import { generateGiftCardCode, hashPin } from "../src/utils/giftCardHelpers.js";
import { withTimeout } from "../src/utils/withTimeout.js";

async function main() {
  await connectDatabase();

  const locks = await prisma.$queryRaw`
    SELECT pid, state, left(query, 120) AS query, wait_event_type, wait_event
    FROM pg_stat_activity
    WHERE datname = current_database() AND state != 'idle'
    ORDER BY query_start
  `;
  console.log("Active queries:", locks);

  const giftLocks = await prisma.$queryRaw`
    SELECT l.locktype, l.mode, l.granted, c.relname
    FROM pg_locks l
    LEFT JOIN pg_class c ON c.oid = l.relation
    WHERE c.relname = 'gift_cards'
  `;
  console.log("gift_cards locks:", giftLocks);

  const user = await prisma.user.findFirst({ where: { isActive: true } });
  console.log("User:", user?.email);

  const code = generateGiftCardCode();
  const pinHash = await hashPin("123456");
  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + 12);

  const t = Date.now();
  console.log("Creating gift card", code);

  try {
    const card = await withTimeout(
      prisma.giftCard.create({
        data: {
          giftCardCode: code,
          pinHash,
          senderId: user.id,
          senderName: "Diag Test",
          recipientName: "Recipient",
          recipientEmail: `diag-${Date.now()}@example.com`,
          amount: 500,
          remainingBalance: 500,
          occasion: "Birthday",
          theme: "luxury-black",
          deliveryMethod: "EMAIL",
          deliveryType: "INSTANT",
          status: "ACTIVE",
          paymentStatus: "CAPTURED",
          paymentProvider: "MOCK",
          expiryDate: expiry,
          grandTotal: 590,
          qrCodeData: `http://localhost:5173/gift-cards/redeem?code=${code}`,
        },
      }),
      12_000,
      "CREATE TIMEOUT",
    );
    console.log("Created OK", card.id, `${Date.now() - t}ms`);
    await prisma.giftCard.delete({ where: { id: card.id } });
    console.log("Cleaned up test row");
  } catch (error) {
    console.error("Create failed:", error.message, `${Date.now() - t}ms`);
    if (error.code) console.error("Code:", error.code);
  }

  await disconnectDatabase();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
