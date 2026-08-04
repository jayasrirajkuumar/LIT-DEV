import MockPaymentProvider from "./mockPaymentProvider.js";
import RazorpayPaymentProvider from "./razorpayPaymentProvider.js";
import StripePaymentProvider from "./stripePaymentProvider.js";

const providers = {
  MOCK: new MockPaymentProvider(),
  RAZORPAY: new RazorpayPaymentProvider(),
  STRIPE: new StripePaymentProvider(),
};

export function getPaymentProvider(name = "MOCK") {
  const provider = providers[name?.toUpperCase()];
  if (!provider) {
    throw new Error(`Unsupported payment provider: ${name}`);
  }
  return provider;
}

export default { getPaymentProvider };
