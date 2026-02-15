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
import { Event } from '../events/schemas/event.schema';
import { RazorpayService } from './razorpay.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Registration.name)
    private readonly registrationModel: Model<Registration>,

    @InjectModel(Event.name)
    private readonly eventModel: Model<Event>,

    private readonly razorpayService: RazorpayService,
  ) {}

  // =====================================================
  // CREATE RAZORPAY ORDER FOR REGISTRATION
  // =====================================================
  async createOrderForRegistration(registrationId: string) {
    const registration = await this.registrationModel.findById(registrationId);
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    // allow fresh or failed payments to create a new order
    if (
      registration.paymentStatus !== PaymentStatus.PENDING &&
      registration.paymentStatus !== PaymentStatus.FAILED
    ) {
      throw new BadRequestException(
        'Payment not allowed for this registration',
      );
    }

    // if previously FAILED, reset to PENDING for retry
    if (registration.paymentStatus === PaymentStatus.FAILED) {
      registration.paymentStatus = PaymentStatus.PENDING;
      await registration.save();
    }

    // Use the TOTAL amount calculated at registration init
    const totalAmount = registration.totalAmount; // FIX: use totalAmount, not ticketPrice
    if (!totalAmount || totalAmount <= 0) {
      throw new BadRequestException('Invalid payment amount');
    }

    const razorpayOrder = await this.razorpayService.createOrder(
      totalAmount,
      registration._id.toString(),
    );

    registration.razorpayOrderId = razorpayOrder.id;
    // ticketPrice is already set by RegistrationsService
    await registration.save();

    return {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    };
  }

  // =====================================================
  // GET PAYMENT DETAILS (FOR PAYMENT PAGE)
  // =====================================================
  async getPaymentDetails(registrationId: string) {
    const registration = await this.registrationModel.findById(registrationId);
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    const event = await this.eventModel.findById(registration.eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
if (event.status !== "PUBLISHED") {
  throw new BadRequestException("Payment not allowed");
}

    const quantity = registration.quantity || 1;

    const basePerTicket = registration.basePricePerTicket;
    const basePrice = basePerTicket * quantity;

    const totalGST = registration.gstAmount || 0;
    const platformFee = registration.platformFee || 0;
    const finalAmount = registration.totalAmount || 0; // base + GST + platform


    return {
      event: {
        title: event.title,
      },
      registration: {
        userName: registration.userName,
        userEmail: registration.userEmail,
        userPhone: registration.userPhone,
        ticketName: registration.ticketName,
        subTicketName: registration.subTicketName,
      },
      pricing: {
        quantity,
        parentTicket: {
          name: registration.ticketName,
          basePrice: basePerTicket,
        },
        total: {
          basePrice,
          totalGST,
          platformFee,
          finalAmount,
        },
      },
    };

    
  }
}
