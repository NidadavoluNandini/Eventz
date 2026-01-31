import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
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
import { TicketsService } from '../tickets/tickets.service';
import { InvoiceService } from '../payments/invoice.service';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectModel(Registration.name)
    private readonly registrationModel: Model<Registration>,

    @InjectModel(Event.name)
    private readonly eventModel: Model<Event>,

    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly ticketsService: TicketsService,
    private readonly invoiceService: InvoiceService,
  ) {}

  // =====================================================
  // STEP 1: INITIATE REGISTRATION (SEND OTP)
  // =====================================================
async initiateRegistration(dto: {
  eventId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  ticketName: string;
  quantity: number;
}) {
  const event = await this.eventModel.findById(dto.eventId);
  if (!event) throw new NotFoundException('Event not found');

  if (event.status !== 'PUBLISHED') {
    throw new BadRequestException('Event not open for registration');
  }

  const ticket = event.tickets.find(
    (t) => t.name === dto.ticketName,
  );

  if (!ticket) {
    throw new BadRequestException('Invalid ticket selected');
  }

  const quantity = dto.quantity || 1;

  // ===============================
  // 💰 PRICE CALCULATION (ONCE ONLY)
  // ===============================
  const basePricePerTicket = ticket.price; // ✅ FIXED
  const gstRate = ticket.gst || 0;              // 18

  const baseTotal = basePricePerTicket * quantity;     // 2000
  const gstAmount = Math.round((baseTotal * gstRate) / 100); // 360
  const totalAmount = baseTotal + gstAmount;           // 2360

  // ===============================
  // 🚫 BLOCK DUPLICATES
  // ===============================
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

  // ===============================
  // ♻️ REUSE PENDING REGISTRATION
  // ===============================
  const existingPending = await this.registrationModel.findOne({
    eventId: new Types.ObjectId(dto.eventId),
    status: { $ne: RegistrationStatus.COMPLETED },
    $or: [{ userEmail: dto.userEmail }, { userPhone: dto.userPhone }],
  });

  if (existingPending) {
    existingPending.ticketName = dto.ticketName;
    existingPending.basePricePerTicket = basePricePerTicket;
    existingPending.quantity = quantity;
    existingPending.gstRate = gstRate;
    existingPending.gstAmount = gstAmount;
    existingPending.totalAmount = totalAmount;

    // ⚠️ backward compatibility
    existingPending.ticketPrice = totalAmount;

    existingPending.otp = otp;
    existingPending.otpExpiresAt = otpExpiresAt;
    existingPending.status = RegistrationStatus.PENDING_OTP;
    existingPending.paymentStatus =
      totalAmount === 0
        ? PaymentStatus.NOT_REQUIRED
        : PaymentStatus.PENDING;

    await existingPending.save();
    await this.sendOtp(dto.userEmail, dto.userPhone, otp);

    return {
      status: 'OTP_SENT',
      registrationId: existingPending._id,
      reused: true,
    };
  }

  // ===============================
  // 🆕 CREATE REGISTRATION
  // ===============================
  const registration = await this.registrationModel.create({
    eventId: new Types.ObjectId(dto.eventId),
    userName: dto.userName,
    userEmail: dto.userEmail,
    userPhone: dto.userPhone,

    ticketName: dto.ticketName,
    basePricePerTicket,
    quantity,
    gstRate,
    gstAmount,
    totalAmount,

    // ⚠️ keep old field for payments
    ticketPrice: totalAmount,

    status: RegistrationStatus.PENDING_OTP,
    paymentStatus:
      totalAmount === 0
        ? PaymentStatus.NOT_REQUIRED
        : PaymentStatus.PENDING,

    otp,
    otpExpiresAt,
  });

  await this.sendOtp(dto.userEmail, dto.userPhone, otp);

  return {
    status: 'OTP_SENT',
    registrationId: registration._id,
  };
}
  // =====================================================
  // STEP 2: VERIFY OTP
  // =====================================================
  async verifyOtp(registrationId: string, otp: number) {
    const registration = await this.registrationModel
      .findById(registrationId)
      .populate('eventId');

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

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
      registration.otp = undefined;
      registration.otpExpiresAt = undefined;

      await registration.save();

      await this.ticketsService.generateAndSendTicket(registration);

      registration.ticketSent = true;
      await registration.save();

      return { requiresPayment: false };
    }

    registration.status = RegistrationStatus.PENDING_PAYMENT;
    registration.paymentStatus = PaymentStatus.PENDING;
    registration.otp = undefined;
    registration.otpExpiresAt = undefined;

    await registration.save();

    return {
      requiresPayment: true,
      amount: registration.ticketPrice,
    };
  }

  // =====================================================
  // STEP 3: COMPLETE REGISTRATION (PAID)
  // =====================================================
  async completeRegistration(
    registrationId: string,
    payment?: {
      razorpayPaymentId?: string;
      razorpayOrderId?: string;
    },
  ) {
    const registration = await this.registrationModel
      .findById(registrationId)
      .populate('eventId');

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.ticketSent) {
      return registration;
    }

    registration.status = RegistrationStatus.COMPLETED;
    registration.paymentStatus = PaymentStatus.PAID;
    registration.registrationNumber = `REG-${Date.now()}`;
    registration.razorpayPaymentId = payment?.razorpayPaymentId;
    registration.razorpayOrderId = payment?.razorpayOrderId;

    await registration.save();

    await this.ticketsService.generateAndSendTicket(registration);

    registration.ticketSent = true;
    await registration.save();

    return registration;
  }

  // =====================================================
  // EXTRA METHODS
  // =====================================================
  async resendOtp(registrationId: string) {
    const reg = await this.registrationModel.findById(registrationId);
    if (!reg) throw new NotFoundException('Registration not found');

    const otp = Math.floor(100000 + Math.random() * 900000);
    reg.otp = otp;
    reg.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await reg.save();

    await this.sendOtp(reg.userEmail, reg.userPhone, otp);

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
async getAttendeesByEvent(eventId: string) {
    return this.registrationModel
      .find({
        eventId,
        status: "COMPLETED",
        paymentStatus: "PAID",
      })
      .select(
        "registrationNumber userName userEmail userPhone ticketName basePricePerTicket quantity gstRate gstAmount totalAmount createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();
  }
  // =====================================================
  // HELPERS
  // =====================================================
  private async sendOtp(email: string, phone: string, otp: number) {
    await this.emailService.sendEmail(
      email,
      'Your OTP for Event Registration',
      `OTP: ${otp}`,
    );
    await this.smsService.sendSms(phone, `OTP: ${otp}`);
  }



}
