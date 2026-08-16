import { purchaseInternalGiftCard } from "../src/services/internalGiftCardService.js";
import { prisma } from "../src/database/prismaClient.js";

const sender = await prisma.user.findFirst({
  where: { displayName: "js" },
  select: { id: true, email: true },
});
const recipient = await prisma.user.findFirst({
  where: { displayName: "Dinesh" },
  select: { id: true, displayName: true },
});

if (!sender || !recipient) {
  console.error("Missing test users");
  process.exit(1);
}

console.log(`Purchasing gift card: ${sender.email} -> ${recipient.displayName}`);

try {
  const result = await purchaseInternalGiftCard(sender.id, {
    recipientId: recipient.id,
    amount: 500,
    senderName: "js",
    message: "Automated wallet purchase test",
    occasion: "Birthday",
    theme: "luxury-black",
    paymentMethod: "WALLET",
  });
  console.log("SUCCESS:", result.giftCard.giftCardCode, result.giftCard.id);
} catch (error) {
  console.error("FAIL:", error.message);
  process.exitCode = 1;
}

await prisma.$disconnect();
