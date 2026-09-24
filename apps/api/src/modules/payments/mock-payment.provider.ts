import { Injectable } from "@nestjs/common";
import { IPaymentProvider } from "./interfaces/ipayment-provider.interface";
import * as crypto from "crypto";

/**
 * Simple in‑memory mock implementation used for tests and local development.
 * It generates deterministic IDs, stores payment records, and validates webhook signatures
 * using a shared secret (MOCK_PAYMENT_SECRET). Duplicate webhook IDs are ignored to ensure
 * idempotency.
 */
@Injectable()
export class MockPaymentProvider implements IPaymentProvider {
  private payments = new Map<string, { amount: number; currency: string; status: string }>();
  private processedWebhooks = new Set<string>();
  private secret = process.env.MOCK_PAYMENT_SECRET || "default-secret";

  async createPayment(
    amount: number,
    currency: string,
    metadata?: Record<string, any>,
  ): Promise<{ providerPaymentId: string; checkoutUrl?: string }> {
    const providerPaymentId = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    this.payments.set(providerPaymentId, { amount, currency, status: "PENDING" });
    const checkoutUrl = `https://example.com/checkout/${providerPaymentId}`;
    return { providerPaymentId, checkoutUrl };
  }

  async verifyPayment(providerPaymentId: string): Promise<boolean> {
    const record = this.payments.get(providerPaymentId);
    return record?.status === "COMPLETED";
  }

  /**
   * Validate HMAC‑SHA256 signature and record the payment status.
   * Expected payload shape: { id: string; providerPaymentId: string; status: string }
   */
  async handleWebhook(payload: any, signature: string): Promise<void> {
    const payloadString = JSON.stringify(payload);
    const expected = crypto.createHmac("sha256", this.secret).update(payloadString).digest("hex");
    // Simple string comparison for mock – in a real provider use HMAC verification.
    if (signature !== expected) {
      throw new Error('Invalid webhook signature');
    }
    const { id, providerPaymentId, status } = payload;
    // Idempotency: ignore if already processed
    if (this.processedWebhooks.has(id)) {
      return;
    }
    this.processedWebhooks.add(id);
    const record = this.payments.get(providerPaymentId);
    if (record) {
      record.status = status;
    }
  }
}
