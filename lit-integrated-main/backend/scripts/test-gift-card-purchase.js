/**
 * Direct service-level test for gift card purchase (no HTTP auth required).
 * Usage: node scripts/test-gift-card-purchase.js
 */
import { connectDatabase, disconnectDatabase } from "../src/database/prismaClient.js";
import { prisma } from "../src/database/prismaClient.js";
import { purchaseGiftCard } from "../src/services/giftCardService.js";

async function main() {
  const started = Date.now();
  console.log("Connecting to database...");
  const db = await connectDatabase();
  if (!db.connected) {
    console.error("Database not connected:", db.error?.message);
    process.exit(1);
  }

  const user = await prisma.user.findFirst({
    where: { isActive: true },
    orderBy: { lastLogin: "desc" },
  });

  if (!user) {
    console.error("No active user found in database.");
    process.exit(1);
  }

  console.log(`Testing purchase as user ${user.email} (${user.id})`);

  const payload = {
    amount: 500,
    recipientName: "Test Recipient",
    recipientEmail: `gc-test-${Date.now()}@example.com`,
    senderName: user.displayName || "Test Sender",
    message: "Automated purchase test",
    occasion: "Birthday",
    theme: "luxury-black",
    deliveryMethod: "EMAIL",
    deliveryType: "INSTANT",
  };

  try {
    const result = await purchaseGiftCard(user.id, payload, { paymentProvider: "MOCK" });
    console.log("SUCCESS in", Date.now() - started, "ms");
    console.log("Gift card code:", result.giftCard?.giftCardCode);
    console.log("PIN:", result.giftCard?.pin);
    console.log("Status:", result.giftCard?.status);
    console.log("Payment:", result.giftCard?.paymentStatus);
  } catch (error) {
    console.error("FAILED in", Date.now() - started, "ms");
    console.error(error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

main();
