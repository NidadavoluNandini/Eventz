import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegistrationsService } from '../registrations/registrations.service';
import { TicketsService } from '../tickets/tickets.service';
import { RazorpayService } from './razorpay.service';
import {
  Registration,
  PaymentStatus,
  RegistrationStatus,
} from '../registrations/schemas/registration.schema';

import { EmailService } from '../notifications/email.service';


@Injectable()
export class PaymentsIntegrationService {
  constructor(
    @InjectModel(Registration.name)
    private registrationModel: Model<Registration>,
    private readonly registrationsService: RegistrationsService,
    private readonly ticketsService: TicketsService,
    private readonly razorpayService: RazorpayService,
    private readonly emailService: EmailService,
  ) {}

  // 🔹 CREATE ORDER
  async createOrderForRegistration(registrationId: string) {
    const registration = await this.registrationModel.findById(registrationId);

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException('Payment not required');
    }

   const totalAmount =
  registration.ticketPrice * registration.quantity;

const order = await this.razorpayService.createOrder(
  totalAmount,
  registrationId,
);

    registration.razorpayOrderId = order.id;
    await registration.save();

    return {
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      registrationId: registration._id,
    };
  }

  // 🔹 VERIFY PAYMENT
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

    // 1️⃣ COMPLETE REGISTRATION
    await this.registrationsService.completeRegistration(
      dto.registrationId,
      {
        razorpayOrderId: dto.razorpay_order_id,
        razorpayPaymentId: dto.razorpay_payment_id,
      },
    );

    // 2️⃣ FETCH FULL REGISTRATION (WITH EVENT)
    const registration = await this.registrationModel
      .findById(dto.registrationId)
      .populate('eventId');

    if (!registration) {
      throw new NotFoundException(
        'Registration not found after payment',
      );
    }

    // 3️⃣ GENERATE + SEND TICKET (SAFE)
    try {
      await this.ticketsService.generateAndSendTicket(
        registration,
      );
    } catch (err) {
      console.error('Ticket generation failed:', err);
      // ⚠️ Do NOT throw – payment already succeeded
    }

    return { success: true };
  }

  // 🔹 WEBHOOK
  async handleWebhook(payload: any, signature: string) {
    const isValid =
      this.razorpayService.verifyWebhookSignature(
        payload,
        signature,
      );

    if (!isValid) {
      throw new BadRequestException(
        'Invalid webhook signature',
      );
    }

    if (payload.event === 'payment.captured') {
      const razorpayOrderId =
        payload.payload.payment.entity.order_id;
      const razorpayPaymentId =
        payload.payload.payment.entity.id;

      const registration =
        await this.registrationModel.findOne({
          razorpayOrderId,
        });

      if (
        registration &&
        registration.status === 'PENDING_PAYMENT'
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

Your payment for the event could not be completed.

👉 Retry payment here:
${process.env.FRONTEND_URL}/payment/${reg._id}

Your spot is still reserved.
`,
  );
}

}
