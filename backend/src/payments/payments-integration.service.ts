import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { RegistrationsService } from '../registrations/registrations.service';
import { RazorpayService } from './razorpay.service';

import {
  Registration,
  PaymentStatus,
  RegistrationStatus,
} from '../registrations/schemas/registration.schema';
import { Event } from '../events/schemas/event.schema';
import { EmailService } from '../notifications/email.service';

@Injectable()
export class PaymentsIntegrationService {
  constructor(
    @InjectModel(Registration.name)
    private registrationModel: Model<Registration>,

    @InjectModel(Event.name)
    private eventModel: Model<Event>,

    private readonly registrationsService: RegistrationsService,
    private readonly razorpayService: RazorpayService,
    private readonly emailService: EmailService,
  ) {}

  // =====================================================
  // CREATE RAZORPAY ORDER
  // =====================================================
  async createOrderForRegistration(registrationId: string) {
    const registration = await this.registrationModel.findById(registrationId);
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.status !== RegistrationStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Payment not required');
    }

    // Use TOTAL amount computed and stored by RegistrationsService
    const totalAmount = registration.totalAmount; // FIX: use totalAmount, not ticketPrice
    if (!totalAmount || totalAmount <= 0) {
      throw new BadRequestException('Invalid payment amount');
    }

    const order = await this.razorpayService.createOrder(
      totalAmount,
      registrationId,
    );

    registration.razorpayOrderId = order.id;
    // ticketPrice remains as set at initiateRegistration/verifyOtp
    await registration.save();

    return {
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      registrationId: registration._id,
    };
  }

  // VERIFY PAYMENT
  async verifyPaymentForRegistration(dto: {
    registrationId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const isValid = this.razorpayService.verifySignature(
      dto.razorpay_order_id,
      dto.razorpay_payment_id,
      dto.razorpay_signature,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid payment signature');
    }

    await this.registrationsService.completeRegistration(dto.registrationId, {
      razorpayOrderId: dto.razorpay_order_id,
      razorpayPaymentId: dto.razorpay_payment_id,
    });

    return { success: true };
  }

  // WEBHOOK
  async handleWebhook(payload: any, signature: string) {
    const isValid = this.razorpayService.verifyWebhookSignature(
      payload,
      signature,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    if (payload.event === 'payment.captured') {
      const razorpayOrderId = payload.payload.payment.entity.order_id;
      const razorpayPaymentId = payload.payload.payment.entity.id;

      const registration = await this.registrationModel.findOne({
        razorpayOrderId,
      });

      if (
        registration &&
        registration.status === RegistrationStatus.PENDING_PAYMENT
      ) {
        await this.registrationsService.completeRegistration(
          registration._id.toString(),
          {
            razorpayOrderId,
            razorpayPaymentId,
          },
        );
      }
    }

    return { status: 'ok' };
  }

  // PAYMENT FAILED
  async markPaymentFailed(registrationId: string) {
    const reg = await this.registrationModel.findById(registrationId);
    if (!reg) return;

    reg.paymentStatus = PaymentStatus.FAILED;
    reg.status = RegistrationStatus.PENDING_PAYMENT;
    await reg.save();

    await this.emailService.sendEmail(
      reg.userEmail,
      '❌ Payment Failed – Retry Your Registration',
      `
Hi ${reg.userName},

Your payment attempt failed.

👉 Retry here:
${process.env.FRONTEND_URL}/payment/${reg._id}

– Eventz Team
`,
    );
  }
}
