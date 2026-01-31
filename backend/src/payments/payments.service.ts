import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Registration,
  PaymentStatus,
} from '../registrations/schemas/registration.schema';

import { RazorpayService } from './razorpay.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Registration.name)
    private readonly registrationModel: Model<Registration>,

    private readonly razorpayService: RazorpayService,
  ) {}

  // =====================================================
  // 💳 CREATE RAZORPAY ORDER FOR REGISTRATION
  // =====================================================
  async createOrderForRegistration(registrationId: string) {
    const registration =
      await this.registrationModel.findById(registrationId);

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.paymentStatus !== PaymentStatus.PENDING) {
      throw new BadRequestException(
        'Payment not allowed for this registration',
      );
    }

    // ✅ FINAL, GST-INCLUDED AMOUNT (SOURCE OF TRUTH)
    const amount = registration.ticketPrice;

    if (!amount || amount <= 0) {
      throw new BadRequestException('Invalid payment amount');
    }

    const razorpayOrder =
      await this.razorpayService.createOrder(
        amount, // ₹236
        registration._id.toString(),
      );

    registration.razorpayOrderId = razorpayOrder.id;
    await registration.save();

    return {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    };
  }
}
