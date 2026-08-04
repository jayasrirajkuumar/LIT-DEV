import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

try {
  const count = await prisma.user.count();
  const users = await prisma.user.findMany({
    select: {
      id: true,
      azureUserId: true,
      email: true,
      displayName: true,
      lastLogin: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  console.log(`users_count=${count}`);
  console.log(JSON.stringify(users, null, 2));
} finally {
  await prisma.$disconnect();
}
