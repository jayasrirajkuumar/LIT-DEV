import { prisma } from "../database/prismaClient.js";
import { DEFAULT_STORE_SETTINGS } from "../constants/defaultStoreSettings.js";

const SETTINGS_KEY = "store_config";

async function ensureDefaults() {
  const existing = await prisma.storeSetting.findUnique({ where: { key: SETTINGS_KEY } });
  if (existing) return existing;

  return prisma.storeSetting.create({
    data: { key: SETTINGS_KEY, value: DEFAULT_STORE_SETTINGS },
  });
}

export async function getStoreSettings() {
  const row = await ensureDefaults();
  return row.value;
}

export async function updateStoreSettings(partial, adminUserId) {
  const row = await ensureDefaults();
  const current = row.value && typeof row.value === "object" ? row.value : DEFAULT_STORE_SETTINGS;

  const merged = { ...current };
  for (const [section, values] of Object.entries(partial)) {
    if (values && typeof values === "object" && !Array.isArray(values)) {
      merged[section] = { ...(merged[section] || {}), ...values };
    }
  }

  const updated = await prisma.storeSetting.update({
    where: { key: SETTINGS_KEY },
    data: { value: merged, updatedBy: adminUserId ?? null },
  });

  return updated.value;
}

export const storeSettingsService = {
  get: getStoreSettings,
  update: updateStoreSettings,
};

export default storeSettingsService;
