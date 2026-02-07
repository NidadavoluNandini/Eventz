// src/payments/payments.service.ts
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

  private calculateGST(basePrice: number, gstPercent: number): number {
    if (!gstPercent) return 0;
    return Math.round((basePrice * gstPercent) / 100);
  }

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

    const event = await this.eventModel.findById(registration.eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const ticket = event.tickets.find(
      (t) => t.name === registration.ticketName,
    );
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const quantity = registration.quantity || 1;

    // Parent ticket: GST applies (per ticket)
    const parentPrice = ticket.price || 0;
    const parentGSTPercent = ticket.gst || 0;
    const parentGSTAmount = this.calculateGST(parentPrice, parentGSTPercent);
    const parentFinal = parentPrice + parentGSTAmount;

    // Sub-ticket: NO GST (per ticket)
    let subPrice = 0;
    if (registration.subTicketName) {
      const subTicket = ticket.subTickets?.find(
        (s) => s.name === registration.subTicketName,
      );
      if (subTicket) {
        subPrice = subTicket.price || 0;
      }
    }

    // Total for all tickets
    const totalAmountPerTicket = parentFinal + subPrice;
    const totalAmount = totalAmountPerTicket * quantity;

    if (!totalAmount || totalAmount <= 0) {
      throw new BadRequestException('Invalid payment amount');
    }

    const razorpayOrder = await this.razorpayService.createOrder(
      totalAmount,
      registration._id.toString(),
    );

    registration.razorpayOrderId = razorpayOrder.id;
    registration.ticketPrice = totalAmount;
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

    const ticket = event.tickets.find(
      (t) => t.name === registration.ticketName,
    );
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const quantity = registration.quantity || 1;

    // Parent ticket: GST applies (per ticket)
    const parentPrice = ticket.price || 0;
    const parentGSTPercent = ticket.gst || 0;
    const parentGSTAmount = this.calculateGST(parentPrice, parentGSTPercent);
    const parentFinal = parentPrice + parentGSTAmount;

    // Sub-ticket: NO GST (per ticket)
    let subPrice = 0;
    let subTicketName: string | null = null;

    if (registration.subTicketName) {
      const subTicket = ticket.subTickets?.find(
        (s) => s.name === registration.subTicketName,
      );
      if (subTicket) {
        subTicketName = subTicket.name;
        subPrice = subTicket.price || 0;
      }
    }

    // Totals for the whole order (quantity)
    const totalBasePerTicket = parentPrice + subPrice;
    const totalBase = totalBasePerTicket * quantity;
    const totalGSTPerTicket = parentGSTAmount; // only parent GST
    const totalGST = totalGSTPerTicket * quantity;
    const totalAmountPerTicket = parentFinal + subPrice;
    const totalAmount = totalAmountPerTicket * quantity;

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
          name: ticket.name,
          basePrice: parentPrice, // per ticket
          gstPercent: parentGSTPercent,
          gstAmount: parentGSTAmount, // per ticket
          finalPrice: parentFinal, // per ticket
        },
        subTicket: subTicketName
          ? {
              name: subTicketName,
              basePrice: subPrice, // per ticket
              gstPercent: 0,
              gstAmount: 0,
              finalPrice: subPrice, // per ticket
            }
          : null,
        total: {
          basePrice: totalBase, // for all quantity
          totalGST, // for all quantity
          finalAmount: totalAmount, // for all quantity
        },
      },
    };
  }
}
