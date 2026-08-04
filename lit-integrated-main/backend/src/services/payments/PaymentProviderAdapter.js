/**
 * Payment provider interface — implement createIntent + capturePayment for each provider.
 */

export class PaymentProviderAdapter {
  constructor(name) {
    this.name = name;
  }

  async createIntent(_payload) {
    throw new Error(`${this.name} createIntent not implemented.`);
  }

  async capturePayment(_payload) {
    throw new Error(`${this.name} capturePayment not implemented.`);
  }
}

export default PaymentProviderAdapter;
