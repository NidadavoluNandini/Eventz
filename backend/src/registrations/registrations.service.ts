import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Registration,
  RegistrationStatus,
  PaymentStatus,
} from './schemas/registration.schema';
import { Event } from '../events/schemas/event.schema';
import { EmailService } from '../notifications/email.service';
import { SmsService } from '../notifications/sms.service';
import { InvoiceService } from '../payments/invoice.service';
import { TicketsService } from '../tickets/tickets.service';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectModel(Registration.name)
    private readonly registrationModel: Model<Registration>,

    @InjectModel(Event.name)
    private readonly eventModel: Model<Event>,

    private readonly emailService: EmailService,
    private readonly smsService: SmsService,

    @Inject(forwardRef(() => InvoiceService))
    private readonly invoiceService: InvoiceService,

    @Inject(forwardRef(() => TicketsService))
    private readonly ticketsService: TicketsService,
  ) {}

  // =====================================================
  // STEP 1: INITIATE REGISTRATION
  // =====================================================
  async initiateRegistration(dto: {
    eventId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    ticketType: string;
    quantity: number;
  }) {
    const event = await this.eventModel.findById(dto.eventId);
    if (!event) throw new NotFoundException('Event not found');

    if (event.status !== 'PUBLISHED') {
      throw new BadRequestException('Event not open for registration');
    }

    const ticket = event.tickets.find(t => t.type === dto.ticketType);
    if (!ticket) throw new BadRequestException('Invalid ticket type');

    if (ticket.available < dto.quantity) {
      throw new BadRequestException('Tickets sold out');
    }

    const completed = await this.registrationModel.findOne({
      eventId: new Types.ObjectId(dto.eventId),
      status: RegistrationStatus.COMPLETED,
      $or: [{ userEmail: dto.userEmail }, { userPhone: dto.userPhone }],
    });

    if (completed) {
      throw new ConflictException('You have already registered');
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const paymentStatus =
      ticket.price === 0
        ? PaymentStatus.NOT_REQUIRED
        : PaymentStatus.PENDING;

    const registration = await this.registrationModel.create({
      eventId: new Types.ObjectId(dto.eventId),
      userName: dto.userName,
      userEmail: dto.userEmail,
      userPhone: dto.userPhone,
      ticketType: dto.ticketType,
      ticketPrice: ticket.price,
      quantity: dto.quantity,
      status: RegistrationStatus.PENDING_OTP,
      paymentStatus,
      otp,
      otpExpiresAt,
    });

    await this.emailService.sendEmail(
  dto.userEmail,
  'Your OTP for Event Registration',
  `
Hi ${dto.userName},

Thank you for your interest in registering for the event "${event.title}".

Your One-Time Password (OTP) to continue the registration process is:

OTP: ${otp}

This OTP is valid for the next 5 minutes. Please do not share it with anyone.

If you did not initiate this request, you can safely ignore this email.

Thank you,
Team Eventz
`,
);


    await this.smsService.sendSms(dto.userPhone, `OTP: ${otp}`);

    return { status: 'OTP_SENT', registrationId: registration._id };
  }

  // =====================================================
  // STEP 2: VERIFY OTP
  // =====================================================
  async verifyOtp(registrationId: string, otp: number) {
    const registration = await this.registrationModel
      .findById(registrationId)
      .populate('eventId');

    if (!registration) throw new NotFoundException('Registration not found');
if (
  !registration.otpExpiresAt ||
  registration.otpExpiresAt < new Date()
) {
  throw new BadRequestException('OTP expired');
}

if (registration.otp !== otp) {
  throw new BadRequestException('Invalid OTP');
}

    registration.otpVerified = true;

    if (registration.ticketPrice === 0) {
      registration.status = RegistrationStatus.COMPLETED;
      registration.paymentStatus = PaymentStatus.NOT_REQUIRED;
      registration.registrationNumber = `REG-${Date.now()}`;

      await registration.save();

      await this.decrementTicketAvailability(
        registration.eventId as Types.ObjectId,
        registration.ticketType,
        registration.quantity,
      );

      await this.ticketsService.generateAndSendTicket(registration);

      registration.ticketSent = true;
      await registration.save();

      return { requiresPayment: false };
    }

    registration.status = RegistrationStatus.PENDING_PAYMENT;
    await registration.save();

    return {
      requiresPayment: true,
      amount: registration.ticketPrice * registration.quantity,
    };
  }

  // =====================================================
  // STEP 3: COMPLETE REGISTRATION (PAID)
  // =====================================================
  async completeRegistration(registrationId: string, payment?: any) {
    const registration = await this.registrationModel
      .findById(registrationId)
      .populate('eventId');

    if (!registration) throw new NotFoundException('Registration not found');
    if (registration.ticketSent) return registration;

    registration.status = RegistrationStatus.COMPLETED;
    registration.paymentStatus = PaymentStatus.PAID;
    registration.registrationNumber = `REG-${Date.now()}`;
    registration.razorpayPaymentId = payment?.razorpayPaymentId;

    await registration.save();

    await this.decrementTicketAvailability(
      registration.eventId as Types.ObjectId,
      registration.ticketType,
      registration.quantity,
    );

    await this.ticketsService.generateAndSendTicket(registration);

    registration.ticketSent = true;
    await registration.save();

    // INVOICE
    const invoicePath = await this.invoiceService.generateInvoicePdf({
      registrationId: registration._id,
      eventTitle: (registration.eventId as any).title,
      userName: registration.userName,
      userEmail: registration.userEmail,
      quantity: registration.quantity,
      unitPrice: registration.ticketPrice,
    });

   await this.emailService.sendEmail(
  registration.userEmail,
  '🧾 Payment Successful – Your Event Invoice',
  `
Hi ${registration.userName},

Thank you for registering for the event "${(registration.eventId as any).title}".

Your payment has been successfully received and your registration is now confirmed.

Please find your invoice attached with this email for your records.

If you have any questions regarding the event or your registration,
feel free to contact the event organizer.

We look forward to seeing you at the event!

— Team Eventz
`,
  [{ filename: 'invoice.pdf', path: invoicePath }],
);


    return registration;
  }

  // =====================================================
  // EXTRA METHODS REQUIRED BY CONTROLLER
  // =====================================================
  async resendOtp(registrationId: string) {
    const reg = await this.registrationModel.findById(registrationId);
    if (!reg) throw new NotFoundException('Registration not found');

    const otp = Math.floor(100000 + Math.random() * 900000);
    reg.otp = otp;
    reg.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await reg.save();

    await this.emailService.sendEmail(
      reg.userEmail,
      'OTP Resent',
      `Your OTP is ${otp}`,
    );

    return { message: 'OTP resent successfully' };
  }

  async findByEvent(eventId: string, organizerId: string) {
    const event = await this.eventModel.findById(eventId);
    if (!event) throw new NotFoundException('Event not found');

    if (event.organizerId.toString() !== organizerId) {
      throw new ForbiddenException('Access denied');
    }

    return this.registrationModel.find({
      eventId: new Types.ObjectId(eventId),
      status: RegistrationStatus.COMPLETED,
    });
  }

  async findByUser(phone: string) {
    return this.registrationModel
      .find({ userPhone: phone })
      .populate('eventId')
      .sort({ createdAt: -1 });
  }

  async findById(id: string) {
    return this.registrationModel.findById(id).populate('eventId');
  }

  async markPaymentCancelled(registrationId: string) {
    return this.registrationModel.findByIdAndUpdate(registrationId, {
      status: RegistrationStatus.PENDING_PAYMENT,
    });
  }

  private async decrementTicketAvailability(
    eventId: Types.ObjectId,
    ticketType: string,
    quantity: number,
  ) {
    const updated = await this.eventModel.findOneAndUpdate(
      {
        _id: eventId,
        'tickets.type': ticketType,
        'tickets.available': { $gte: quantity },
      },
      { $inc: { 'tickets.$.available': -quantity } },
    );

    if (!updated) throw new BadRequestException('Tickets sold out');
  }
}
