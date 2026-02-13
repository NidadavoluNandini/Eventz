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
import { OtherAttendeesDto } from './dto/other-attendees.dto';

type ExtraUserInfoDto = {
  linkedin?: string;
  gender?: string;
  altPhone?: string;
  altEmail?: string;
  dob?: string | Date;
  country?: string;
  state?: string;
  postalCode?: string;
  organization?: string;
  designation?: string;
  collegeId?: string;
  employeeId?: string;
  tShirtSize?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
};

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
async initiateRegistration(
  dto: {
    eventId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    ticketName: string;
    subTicketName?: string;
    quantity: number;
  } & ExtraUserInfoDto &
    OtherAttendeesDto,
) {
  const event = await this.eventModel.findById(dto.eventId);
  if (!event) throw new NotFoundException('Event not found');

  if (event.status !== 'PUBLISHED') {
    throw new BadRequestException('Event not open for registration');
  }

  // 1) Enforce mandatory attendee fields from event.attendeeFieldConfig.optional
  const optConfig = event.attendeeFieldConfig?.optional || {};
  const missing: string[] = [];

  const requiredChecks: Array<[keyof ExtraUserInfoDto, string]> = [
    ['linkedin', 'LinkedIn URL'],
    ['gender', 'Gender'],
    ['altPhone', 'Alternate phone'],
    ['altEmail', 'Alternate email'],
    ['dob', 'Date of birth'],
    ['country', 'Country'],
    ['state', 'State'],
    ['postalCode', 'Postal code'],
    ['organization', 'Organization'],
    ['designation', 'Designation'],
    ['collegeId', 'College ID'],
    ['employeeId', 'Employee ID'],
    ['tShirtSize', 'T-shirt size'],
    ['emergencyContactName', 'Emergency contact name'],
    ['emergencyContactPhone', 'Emergency contact phone'],
  ];

  for (const [fieldKey, label] of requiredChecks) {
    if (optConfig[fieldKey] && !dto[fieldKey]) {
      missing.push(label);
    }
  }

  if (missing.length > 0) {
    throw new BadRequestException(
      `Missing required attendee fields: ${missing.join(', ')}`,
    );
  }

  // 2) Ticket price logic – use base prices from event tickets + subTicket
  const ticket = event.tickets.find((t) => t.name === dto.ticketName);
  if (!ticket) {
    throw new BadRequestException('Invalid ticket selected');
  }

  const quantity = dto.quantity && dto.quantity > 0 ? dto.quantity : 1;

  let basePricePerTicket = 0;
  let gstRate = ticket.gst || 0;

  // === FIXED BASE PRICE LOGIC ===
  // Treat ticket.price as pure base (e.g. 100), finalPrice as display-only (base+GST)
  if (ticket.price != null) {
    basePricePerTicket = ticket.price;
  } else if (ticket.finalPrice != null && ticket.finalPrice > 0) {
    // Fallback if only finalPrice is set: derive base from finalPrice and gstRate
    basePricePerTicket = Math.round(
      ticket.finalPrice / (1 + (gstRate || 0) / 100),
    );
  }

  let subTicketPrice: number | undefined;
  if (dto.subTicketName && ticket.subTickets?.length) {
    const subTicket = ticket.subTickets.find(
      (s) => s.name === dto.subTicketName,
    );
    if (!subTicket) {
      throw new BadRequestException('Invalid sub-ticket selected');
    }

    // For sub-ticket we assume price is base, finalPrice is display-only
    if (subTicket.price != null) {
      subTicketPrice = subTicket.price;
    } else if (subTicket.finalPrice != null && subTicket.finalPrice > 0) {
      subTicketPrice = subTicket.finalPrice;
    }

    if (subTicketPrice != null) {
      basePricePerTicket += subTicketPrice;
    }
  }

  const parentPriceConfigured =
    ticket.finalPrice != null || ticket.price != null;
  const subPriceConfigured =
    dto.subTicketName != null && subTicketPrice != null;

  if (!parentPriceConfigured && !subPriceConfigured) {
    throw new BadRequestException('Ticket price not configured');
  }

  // base for all tickets (no GST/platform yet)
  const baseTotal = basePricePerTicket * quantity;

  // GST ONLY on base
  const gstAmount = Math.round((baseTotal * (gstRate || 0)) / 100);

  // Platform fee percent from event settings (mirror frontend)
  const platformPercent = event.paymentSettings?.collectPaymentCharges
    ? event.paymentSettings.platformFeePercent ?? 0
    : 0;

  // Platform fee on (base + GST)
  const basePlusGstTotal = baseTotal + gstAmount;
  const platformFee = Math.round(
    (basePlusGstTotal * platformPercent) / 100,
  );

  // Final amount: base + GST + platform
  const finalAmount = baseTotal + gstAmount + platformFee;

  // 3) Prevent duplicate completed registration
  const completed = await this.registrationModel.findOne({
    eventId: new Types.ObjectId(dto.eventId),
    status: RegistrationStatus.COMPLETED,
    $or: [{ userEmail: dto.userEmail }, { userPhone: dto.userPhone }],
  });
  if (completed) {
    throw new ConflictException('You have already registered');
  }

  const otpNumber = Math.floor(100000 + Math.random() * 900000);
  const otp = otpNumber.toString();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

  const paymentStatusForAmount =
    finalAmount === 0 ? PaymentStatus.NOT_REQUIRED : PaymentStatus.PENDING;

  const {
    otherAttendees,      // <-- from OtherAttendeesDto
    linkedin,
    gender,
    altPhone,
    altEmail,
    dob,
    country,
    state,
    postalCode,
    organization,
    designation,
    collegeId,
    employeeId,
    tShirtSize,
    emergencyContactName,
    emergencyContactPhone,
  } = dto;

  // 4) Reuse pending registration if exists
  const existingPending = await this.registrationModel.findOne({
    eventId: new Types.ObjectId(dto.eventId),
    status: { $ne: RegistrationStatus.COMPLETED },
    $or: [{ userEmail: dto.userEmail }, { userPhone: dto.userPhone }],
  });

  if (existingPending) {
    existingPending.ticketName = dto.ticketName;
    existingPending.subTicketName = dto.subTicketName || undefined;

    existingPending.basePricePerTicket = basePricePerTicket;
    existingPending.quantity = quantity;
    existingPending.gstRate = gstRate;
    existingPending.gstAmount = gstAmount;
    existingPending.platformFee = platformFee;
    existingPending.totalAmount = finalAmount;
    existingPending.ticketPrice = finalAmount / quantity;

    existingPending.linkedin = linkedin ?? existingPending.linkedin;
    existingPending.gender = gender ?? existingPending.gender;
    existingPending.altPhone = altPhone ?? existingPending.altPhone;
    existingPending.altEmail = altEmail ?? existingPending.altEmail;
    existingPending.dob = dob ? new Date(dob) : existingPending.dob;
    existingPending.country = country ?? existingPending.country;
    existingPending.state = state ?? existingPending.state;
    existingPending.postalCode =
      postalCode ?? existingPending.postalCode;
    existingPending.organization =
      organization ?? existingPending.organization;
    existingPending.designation =
      designation ?? existingPending.designation;
    existingPending.collegeId = collegeId ?? existingPending.collegeId;
    existingPending.employeeId =
      employeeId ?? existingPending.employeeId;
    existingPending.tShirtSize =
      tShirtSize ?? existingPending.tShirtSize;
    existingPending.emergencyContactName =
      emergencyContactName ?? existingPending.emergencyContactName;
    existingPending.emergencyContactPhone =
      emergencyContactPhone ?? existingPending.emergencyContactPhone;

    // NEW: persist other attendees on reuse as well
    existingPending.otherAttendees =
      otherAttendees ?? existingPending.otherAttendees ?? [];

    existingPending.otp = otpNumber;
    existingPending.otpExpiresAt = otpExpiresAt;
    existingPending.status = RegistrationStatus.PENDING_OTP;
    existingPending.paymentStatus = paymentStatusForAmount;

    await existingPending.save();
    await this.sendOtp(dto.userEmail, dto.userPhone, otp);

    return {
      status: 'OTP_SENT',
      registrationId: existingPending._id,
      reused: true,
    };
  }

  // 5) Create new registration
  const registration = await this.registrationModel.create({
    eventId: new Types.ObjectId(dto.eventId),
    userName: dto.userName,
    userEmail: dto.userEmail,
    userPhone: dto.userPhone,

    linkedin,
    gender,
    altPhone,
    altEmail,
    dob: dob ? new Date(dob) : undefined,
    country,
    state,
    postalCode,
    organization,
    designation,
    collegeId,
    employeeId,
    tShirtSize,
    emergencyContactName,
    emergencyContactPhone,

    // NEW: save array here
    otherAttendees: otherAttendees || [],

    ticketName: dto.ticketName,
    subTicketName: dto.subTicketName || undefined,
    basePricePerTicket,
    quantity,
    gstRate,
    gstAmount,
    platformFee,
    totalAmount: finalAmount,
    ticketPrice: finalAmount / quantity,

    status: RegistrationStatus.PENDING_OTP,
    paymentStatus: paymentStatusForAmount,
    otp: otpNumber,
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

    await this.sendOtp(reg.userEmail, reg.userPhone, otp.toString());

    return { message: 'OTP resent successfully' };
  }

  async findByEvent(eventId: string, organizerId: string) {
    const event = await this.eventModel.findById(eventId);
    if (!event) throw new NotFoundException('Event not found');

    if (event.organizerId.toString() !== organizerId) {
      throw new ForbiddenException('Access denied');
    }

    const regs = await this.registrationModel
      .find({ eventId: new Types.ObjectId(eventId) })
      .select(
        'userName userEmail userPhone ticketName subTicketName status paymentStatus createdAt',
      )
      .sort({ createdAt: -1 })
      .lean();

    return regs;
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
        status: 'COMPLETED',
        paymentStatus: 'PAID',
      })
      .select(
        'registrationNumber userName userEmail userPhone ticketName basePricePerTicket quantity gstRate gstAmount totalAmount createdAt',
      )
      .sort({ createdAt: -1 })
      .lean();
  }

  // =====================================================
  // HELPERS
  // =====================================================
  private async sendOtp(email: string, phone: string, otp: string) {
    await this.emailService.sendOtpEmail(email, otp);
    await this.smsService.sendSms(phone, `OTP: ${otp}`);
  }
}
