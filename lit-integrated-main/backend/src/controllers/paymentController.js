import { createPaymentOrder, verifyRazorpayPayment, getPaymentConfig } from "../services/paymentService.js";

export async function postCreateOrder(req, res) {
  const order = await createPaymentOrder(req.dbUser.id, req.validatedBody);
  res.json({ success: true, message: "Payment order created.", data: { order } });
}

export async function postVerifyPayment(req, res) {
  const result = await verifyRazorpayPayment(req.dbUser.id, req.validatedBody);
  res.json({ success: true, message: "Payment verified.", data: result });
}

export async function getPaymentsConfig(req, res) {
  res.json({ success: true, message: "Payment config loaded.", data: getPaymentConfig() });
}

export default { postCreateOrder, postVerifyPayment, getPaymentsConfig };
