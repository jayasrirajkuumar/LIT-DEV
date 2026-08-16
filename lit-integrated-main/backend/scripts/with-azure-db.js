#!/usr/bin/env node
/**
 * Run Prisma CLI against Azure PostgreSQL (uses DATABASE_URL from backend/.env).
 * Usage: node scripts/with-azure-db.js migrate deploy
 */
import { spawnSync } from "child_process";
import config from "../src/config/env.js";

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/with-azure-db.js <prisma-subcommand> [args...]");
  process.exit(1);
}

const result = spawnSync("npx", ["prisma", ...args], {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: config.databaseUrl },
  shell: true,
});

process.exit(result.status ?? 1);
