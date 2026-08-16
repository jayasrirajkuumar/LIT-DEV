import { describeUserSearch } from "../src/services/internalGiftCardService.js";
import { prisma } from "../src/database/prismaClient.js";

const me = await prisma.user.findFirst({
  where: { displayName: "js" },
  select: { id: true, email: true },
});

console.log("Signed-in as:", me);

for (const q of ["js", "Rajkumar", "Anjum", "Deena", "xyz"]) {
  const result = await describeUserSearch(q, me?.id);
  console.log(`"${q}" ->`, result.users.map((u) => u.displayName), "| hint:", result.hint);
}

await prisma.$disconnect();
