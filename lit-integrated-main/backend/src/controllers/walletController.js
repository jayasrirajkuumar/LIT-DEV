import { getWallet, getWalletHistory, payWithWallet, addMoneyToWallet } from "../services/walletService.js";
import { AppError } from "../utils/AppError.js";

export async function getMyWallet(req, res) {
  const wallet = await getWallet(req.dbUser.id);
  res.json({ success: true, message: "Wallet loaded.", data: { wallet } });
}

export async function getMyWalletHistory(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 50;
  const history = await getWalletHistory(req.dbUser.id, { page, limit });
  res.json({ success: true, message: "Wallet history loaded.", data: history });
}

export async function postWalletPay(req, res) {
  const { amount, description, referenceType, referenceId } = req.validatedBody;
  const wallet = await payWithWallet(req.dbUser.id, amount, description || "Wallet payment", {
    type: referenceType,
    id: referenceId,
  });
  res.json({ success: true, message: "Payment completed.", data: { wallet } });
}

export async function postWalletAddMoney(req, res) {
  const { amount, description } = req.validatedBody;
  const wallet = await addMoneyToWallet(req.dbUser.id, amount, { description });
  res.json({ success: true, message: "Wallet credited.", data: { wallet } });
}

export default { getMyWallet, getMyWalletHistory, postWalletPay, postWalletAddMoney };
