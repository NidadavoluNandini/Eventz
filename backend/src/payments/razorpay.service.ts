import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class RazorpayService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  async createOrder(amount: number, receipt: string) {
    try {
      return await this.razorpay.orders.create({
        amount: amount * 100, // paise
        currency: 'INR',
        receipt,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Razorpay order creation failed',
      );
    }
  }

  verifySignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ): boolean {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    return expectedSignature === razorpaySignature;
  }

  verifyWebhookSignature(payload: any, signature: string): boolean {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

    const expected = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return expected === signature;
  }
}
