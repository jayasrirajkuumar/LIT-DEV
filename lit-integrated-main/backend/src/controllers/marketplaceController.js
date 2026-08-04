import { getMarketplacePublicConfig } from "../services/marketplaceConfigService.js";

export async function getMarketplaceConfig(_req, res) {
  const config = await getMarketplacePublicConfig();
  res.json({ success: true, data: config });
}

export default { getMarketplaceConfig };
