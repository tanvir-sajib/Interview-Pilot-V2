export interface IPaymentProvider {
  /**
   * Create a payment intent or charge with the external provider.
   * Returns an identifier used to later verify the payment and (optionally) a checkout URL.
   */
  createPayment(amount: number, currency: string, metadata?: Record<string, any>): Promise<{ providerPaymentId: string; checkoutUrl?: string }>;

  /** Verify the status of a payment using the provider's identifier. */
  verifyPayment(providerPaymentId: string): Promise<boolean>;

  /** Process a webhook payload from the provider. */
  handleWebhook(payload: any, signature: string): Promise<void>;
}
