import { PaymentProviderAdapter } from "./PaymentProviderAdapter.js";

/** Stripe adapter — reserved for future integration. */
export class StripePaymentProvider extends PaymentProviderAdapter {
  constructor() {
    super("STRIPE");
  }

  async createIntent({ amount, currency, orderId, orderNumber }) {
    return {
      provider: "STRIPE",
      providerRef: null,
      amount,
      currency,
      metadata: { orderId, orderNumber, note: "Stripe integration pending." },
    };
  }

  async capturePayment() {
    throw new Error("Stripe capture is not configured yet.");
  }
}

export default StripePaymentProvider;
