#!/usr/bin/env node
/**
 * Verify Azure PostgreSQL connectivity and list real registered users.
 * Usage: node scripts/verify-azure-db.js
 */
import { PrismaClient } from "@prisma/client";
import config from "../src/config/env.js";

const prisma = new PrismaClient();

function maskEmail(email) {
  if (!email || !email.includes("@")) return email ?? "—";
  const [local, domain] = email.split("@");
  const visible = local.length <= 2 ? local[0] : `${local.slice(0, 2)}***`;
  return `${visible}@${domain}`;
}

async function main() {
  console.log("=== LIT Database Verification ===\n");
  console.log(`Profile:     azure (only)`);
  console.log(`Host:        ${config.databaseHost}`);
  console.log(`Azure URL:   ${config.azureDatabaseUrl ? "configured in .env" : "not detected"}\n`);

  const isAzure = config.databaseHost?.includes(".postgres.database.azure.com");
  if (!isAzure) {
    console.error("✗ DATABASE_URL must point to Azure PostgreSQL (*.postgres.database.azure.com).");
    console.error("  Update backend/.env with your Azure connection string.\n");
    process.exit(1);
  }

  try {
    const started = Date.now();
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log(`✓ Connected (${Date.now() - started}ms)\n`);

    const total = await prisma.user.count();
    const active = await prisma.user.count({ where: { isActive: true } });

    console.log(`Users in database: ${total} total, ${active} active\n`);

    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        displayName: true,
        email: true,
        phoneNumber: true,
        username: true,
        role: true,
        lastLogin: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    if (users.length === 0) {
      console.log("No active users found.");
      console.log("Real users are created when members sign in via Azure (POST /api/auth/sync).");
      return;
    }

    console.log("Active users (newest first):");
    for (const user of users) {
      const name = user.displayName || "(no name)";
      const phone = user.phoneNumber ? user.phoneNumber.replace(/\d(?=\d{2})/g, "X") : "—";
      const login = user.lastLogin ? user.lastLogin.toISOString().slice(0, 10) : "never";
      console.log(`  • ${name} | ${maskEmail(user.email)} | phone: ${phone} | @${user.username ?? "—"} | ${user.role} | last login: ${login}`);
    }

    if (active > users.length) {
      console.log(`\n  … and ${active - users.length} more`);
    }

    console.log("\n✓ Gift card user search reads from this database (excluding the signed-in user).");
  } catch (error) {
    console.error(`✗ Connection failed: ${error.message}`);
    if (isAzure) {
      console.error("\nAzure troubleshooting:");
      console.error("  1. Connect to your company VPN (if required)");
      console.error("  2. Add your IP in Azure Portal → PostgreSQL → Networking → Firewall rules");
      console.error("  3. Confirm DATABASE_URL in .env includes ?sslmode=require");
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
