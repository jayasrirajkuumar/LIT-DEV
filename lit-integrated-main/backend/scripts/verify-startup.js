#!/usr/bin/env node
/**
 * Validates backend foundation: env, Prisma client, DB connectivity, HTTP health.
 * Usage: node scripts/verify-startup.js
 */
import config from "../src/config/env.js";
import { PrismaClient } from "@prisma/client";

const checks = [];

function pass(label, detail = "") {
  checks.push({ label, ok: true, detail });
  console.log(`✓ ${label}${detail ? ` — ${detail}` : ""}`);
}

function fail(label, detail = "") {
  checks.push({ label, ok: false, detail });
  console.error(`✗ ${label}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  pass("Node", process.version);

  if (!config.databaseUrl) {
    fail("DATABASE_URL", "missing");
    process.exit(1);
  }
  pass("DATABASE_URL", "set");
  pass("Database host", config.databaseHost);

  const prisma = new PrismaClient();
  const started = Date.now();
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    pass("Database connectivity", `${Date.now() - started}ms`);
  } catch (error) {
    fail("Database connectivity", `${error.code ?? "ERR"}: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }

  try {
    const res = await fetch("http://localhost:3001/api/health");
    const body = await res.json();
    if (res.ok && body.database === "connected") {
      pass("HTTP /api/health", "database connected");
    } else if (res.status === 503 && body.database === "disconnected") {
      fail("HTTP /api/health", body.reason ?? "degraded");
    } else {
      fail("HTTP /api/health", `status ${res.status}`);
    }
  } catch (error) {
    fail("HTTP /api/health", `backend not running — ${error.message}`);
  }

  const failed = checks.filter((c) => !c.ok);
  if (failed.length) {
    console.error(`\n${failed.length} check(s) failed.`);
    process.exit(1);
  }
  console.log("\nAll startup checks passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
