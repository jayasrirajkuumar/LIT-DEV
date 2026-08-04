import { PaymentProviderAdapter } from "./PaymentProviderAdapter.js";

export class MockPaymentProvider extends PaymentProviderAdapter {
  constructor() {
    super("MOCK");
  }

  async createIntent({ amount, currency, orderId, orderNumber }) {
    return {
      provider: "MOCK",
      providerRef: `mock_intent_${orderNumber}`,
      amount,
      currency,
      metadata: { orderId, simulated: true },
    };
  }

  async capturePayment({ paymentIntentId, amount, currency, orderNumber }) {
    return {
      provider: "MOCK",
      providerTxnId: `mock_txn_${orderNumber}_${Date.now()}`,
      status: "CAPTURED",
      amount,
      currency,
      rawResponse: {
        paymentIntentId,
        message: "Mock payment captured successfully.",
      },
    };
  }
}

export default MockPaymentProvider;
