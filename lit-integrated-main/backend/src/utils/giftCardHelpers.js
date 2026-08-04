import crypto from "crypto";
import { promisify } from "util";
import config from "../config/env.js";

const scrypt = promisify(crypto.scrypt);

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const SCRYPT_OPTIONS = config.isProduction
  ? { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }
  : { N: 1024, r: 8, p: 1, maxmem: 16 * 1024 * 1024 };
export function generateGiftCardCode() {
  const segment = () =>
    Array.from({ length: 4 }, () => CODE_CHARS[crypto.randomInt(0, CODE_CHARS.length)]).join("");
  return `LIT-${segment()}-${segment()}-${segment()}`;
}

export function generatePin() {
  return String(crypto.randomInt(100000, 999999));
}

export function createPlaceholderPinHash() {
  return `pending:${crypto.randomUUID()}`;
}

export async function hashPin(pin) {
  const salt = crypto.randomBytes(16).toString("hex");
  if (!config.isProduction) {
    const hash = crypto.createHash("sha256").update(`${salt}:${pin}`).digest("hex");
    return `dev:${salt}:${hash}`;
  }
  const derived = await scrypt(String(pin), salt, 64, SCRYPT_OPTIONS);
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPin(pin, pinHash) {
  if (!pinHash || !pin || pinHash.startsWith("pending:")) return false;
  if (pinHash.startsWith("dev:")) {
    const [, salt, hash] = pinHash.split(":");
    if (!salt || !hash) return false;
    const derived = crypto.createHash("sha256").update(`${salt}:${pin}`).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"));
  }
  const [salt, hash] = pinHash.split(":");
  if (!salt || !hash) return false;
  const derived = await scrypt(String(pin), salt, 64, SCRYPT_OPTIONS);
  const hashBuffer = Buffer.from(hash, "hex");
  return crypto.timingSafeEqual(hashBuffer, derived);
}

export function normalizeGiftCardCode(code) {
  return String(code || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

export default {
  generateGiftCardCode,
  generatePin,
  createPlaceholderPinHash,
  hashPin,
  verifyPin,
  normalizeGiftCardCode,
};