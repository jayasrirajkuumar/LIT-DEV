import { getAdminWalletAnalytics, listAdminWallets, adminRefundWallet } from "../services/walletService.js";

export async function getAdminWalletStats(req, res) {
  const analytics = await getAdminWalletAnalytics();
  res.json({ success: true, message: "Wallet analytics loaded.", data: { analytics } });
}

export async function getAdminWallets(req, res) {
  const result = await listAdminWallets({
    search: req.query.search,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  res.json({ success: true, message: "Wallets loaded.", data: result });
}

export async function postAdminWalletRefund(req, res) {
  const { userId, amount, reason } = req.validatedBody;
  const wallet = await adminRefundWallet(userId, amount, req.dbUser.id, reason);
  res.json({ success: true, message: "Wallet refunded.", data: { wallet } });
}

export default { getAdminWalletStats, getAdminWallets, postAdminWalletRefund };
