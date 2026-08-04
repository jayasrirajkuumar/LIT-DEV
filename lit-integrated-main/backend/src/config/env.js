import dotenv from "dotenv";
import { z } from "zod";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..", "..");

const envPath = path.join(backendRoot, ".env");
const envLocalPath = path.join(backendRoot, ".env.local");

const baseEnvFile = fs.existsSync(envPath) ? dotenv.parse(fs.readFileSync(envPath)) : {};
const localEnvFile = fs.existsSync(envLocalPath) ? dotenv.parse(fs.readFileSync(envLocalPath)) : {};

dotenv.config({ path: envPath });
dotenv.config({ path: envLocalPath, override: true });

function getDatabaseHost(url) {
  const match = String(url || "").match(/@([^:/]+)/);
  return match?.[1] ?? null;
}

const baseHost = getDatabaseHost(baseEnvFile.DATABASE_URL);
const wantsLocal = process.env.DATABASE_PROFILE === "local";
const wantsAzure = process.env.DATABASE_PROFILE === "azure";

if (wantsAzure && baseEnvFile.DATABASE_URL) {
  process.env.DATABASE_URL = baseEnvFile.DATABASE_URL;
} else if (wantsLocal && localEnvFile.DATABASE_URL) {
  process.env.DATABASE_URL = localEnvFile.DATABASE_URL;
}

function validateDatabaseUrl(url) {
  const issues = [];
  if (!url) {
    issues.push("DATABASE_URL is required");
    return issues;
  }

  if (!url.startsWith("postgresql://") && !url.startsWith("postgres://")) {
    issues.push("DATABASE_URL must use postgresql:// scheme");
  }

  if (url.includes(".postgres.database.azure.com") && !/[?&]sslmode=/.test(url)) {
    issues.push("Azure PostgreSQL requires sslmode=require in DATABASE_URL");
  }

  return issues;
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_SSL_CA_PATH: z.string().optional(),
  AZURE_TENANT_ID: z.string().uuid("AZURE_TENANT_ID must be a valid UUID"),
  AZURE_CLIENT_ID: z.string().uuid("AZURE_CLIENT_ID must be a valid UUID"),
  AZURE_CIAM_SUBDOMAIN: z.string().min(1),
  AZURE_USER_FLOW: z.string().min(1).default("LIT-Web-App"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  RATE_LIMIT_MAX: z.coerce
    .number()
    .int()
    .positive()
    .default(process.env.NODE_ENV === "production" ? 100 : 1000),
  AUTH_RATE_LIMIT_MAX: z.coerce
    .number()
    .int()
    .positive()
    .default(process.env.NODE_ENV === "production" ? 30 : 200),
  AZURE_STORAGE_CONNECTION_STRING: z.string().optional(),
  AZURE_STORAGE_CONTAINER_NAME: z.string().default("product-images"),
  PUBLIC_API_URL: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1"),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default("Luxury In Taste <info@luxuryintaste.com>"),
  SUPPORT_EMAIL: z.string().email().default("info@luxuryintaste.com"),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  SUPPORT_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

const databaseIssues = validateDatabaseUrl(env.DATABASE_URL);
if (databaseIssues.length) {
  console.error("DATABASE_URL validation failed:");
  for (const issue of databaseIssues) {
    console.error(`  - ${issue}`);
  }
  process.exit(1);
}

function buildAzureIssuers(tenantId, ciamSubdomain, userFlow) {
  const issuers = new Set([
    // CIAM tokens commonly use tenant-id subdomain (per OpenID metadata)
    `https://${tenantId}.ciamlogin.com/${tenantId}/v2.0`,
    `https://${tenantId}.ciamlogin.com/${tenantId}/v2.0/`,
    // Some flows use the configured CIAM subdomain
    `https://${ciamSubdomain}.ciamlogin.com/${tenantId}/v2.0`,
    `https://${ciamSubdomain}.ciamlogin.com/${tenantId}/v2.0/`,
    // User-flow (policy) issuers
    `https://${ciamSubdomain}.ciamlogin.com/${tenantId}/${userFlow}/v2.0`,
    `https://${ciamSubdomain}.ciamlogin.com/${tenantId}/${userFlow}/v2.0/`,
    `https://${tenantId}.ciamlogin.com/${tenantId}/${userFlow}/v2.0`,
    `https://${tenantId}.ciamlogin.com/${tenantId}/${userFlow}/v2.0/`,
  ]);

  return [...issuers];
}

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  corsOrigins: env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
  databaseUrl: env.DATABASE_URL,
  databaseHost: getDatabaseHost(env.DATABASE_URL),
  localDatabaseUrl: (() => {
    const host = getDatabaseHost(localEnvFile.DATABASE_URL);
    return host === "localhost" || host === "127.0.0.1" ? localEnvFile.DATABASE_URL : null;
  })(),
  azureDatabaseUrl: baseHost?.includes(".postgres.database.azure.com")
    ? baseEnvFile.DATABASE_URL
    : null,
  databaseSslCaPath: env.DATABASE_SSL_CA_PATH,
  azure: {
    tenantId: env.AZURE_TENANT_ID,
    clientId: env.AZURE_CLIENT_ID,
    ciamSubdomain: env.AZURE_CIAM_SUBDOMAIN,
    userFlow: env.AZURE_USER_FLOW,
    issuer: `https://${env.AZURE_TENANT_ID}.ciamlogin.com/${env.AZURE_TENANT_ID}/v2.0`,
    acceptedIssuers: buildAzureIssuers(
      env.AZURE_TENANT_ID,
      env.AZURE_CIAM_SUBDOMAIN,
      env.AZURE_USER_FLOW,
    ),
    jwksUri: `https://${env.AZURE_CIAM_SUBDOMAIN}.ciamlogin.com/${env.AZURE_TENANT_ID}/discovery/v2.0/keys`,
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    authMax: env.AUTH_RATE_LIMIT_MAX,
  },
  storage: {
    connectionString: env.AZURE_STORAGE_CONNECTION_STRING ?? null,
    containerName: env.AZURE_STORAGE_CONTAINER_NAME,
  },
  publicApiUrl:
    env.PUBLIC_API_URL ??
    `http://localhost:${env.PORT}`,
  isProduction: env.NODE_ENV === "production",
  email: {
    enabled: Boolean(env.SMTP_HOST),
    smtpHost: env.SMTP_HOST ?? null,
    smtpPort: env.SMTP_PORT,
    smtpSecure: env.SMTP_SECURE ?? false,
    smtpUser: env.SMTP_USER ?? null,
    smtpPass: env.SMTP_PASS ?? null,
    from: env.SMTP_FROM,
    supportInbox: env.SUPPORT_EMAIL,
  },
  supportRateLimitMax: env.SUPPORT_RATE_LIMIT_MAX,
  razorpay: {
    keyId: env.RAZORPAY_KEY_ID ?? null,
    keySecret: env.RAZORPAY_KEY_SECRET ?? null,
  },
  frontendUrl: env.FRONTEND_URL,
};

export default config;
