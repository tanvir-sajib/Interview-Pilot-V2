import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from '../src/modules/payments/payments.controller';
import { PaymentsService } from '../src/modules/payments/payments.service';
import { MockPaymentProvider } from '../src/modules/payments/mock-payment.provider';
import { BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

jest.mock('../src/prisma/prisma.service');

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let mockProvider: MockPaymentProvider;

  beforeEach(async () => {
    process.env.MOCK_PAYMENT_SECRET = 'test-secret';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        PaymentsService,
        { provide: 'PAYMENT_PROVIDER', useClass: MockPaymentProvider },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    mockProvider = module.get<MockPaymentProvider>('PAYMENT_PROVIDER') as any;
  });

  it('accepts a valid webhook signature', async () => {
    const payment = await mockProvider.createPayment(1000, 'USD');
    const payload = { id: 'wh-1', providerPaymentId: payment.providerPaymentId, status: 'COMPLETED' };
    const signature = crypto.createHmac('sha256', process.env.MOCK_PAYMENT_SECRET!).update(JSON.stringify(payload)).digest('hex');
    const result = await controller.webhook(payload, signature);
    expect(result).toEqual({ received: true });
    // Verify payment status updated
    const verified = await mockProvider.verifyPayment(payment.providerPaymentId);
    // In mock, verifyPayment checks for COMPLETED status
    expect(verified).toBe(true);
  });

  it('rejects an invalid webhook signature', async () => {
    const payment = await mockProvider.createPayment(2000, 'USD');
    const payload = { id: 'wh-2', providerPaymentId: payment.providerPaymentId, status: 'COMPLETED' };
    const badSignature = 'invalidsignature';
    await expect(controller.webhook(payload, badSignature)).rejects.toThrow(BadRequestException);
  });
});
