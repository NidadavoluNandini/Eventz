import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { QrService } from './qr.service';
import { PdfService } from './pdf.service';
import { EmailService } from '../notifications/email.service';
import { ticketConfirmationTemplate } from './ticket-confirmation.template';

import {
  Registration,
  RegistrationStatus,
} from '../registrations/schemas/registration.schema';

import { Event } from '../events/schemas/event.schema';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Registration.name)
    private readonly registrationModel: Model<Registration>,

    @InjectModel(Event.name)
    private readonly eventModel: Model<Event>,

    private readonly qrService: QrService,
    private readonly pdfService: PdfService,
    private readonly emailService: EmailService,
  ) {}

  // =====================================================
  // 🎟 GENERATE + EMAIL TICKET
  // =====================================================
async generateAndSendTicket(reg: Registration) {
  if (reg.ticketSent) return;

  if (reg.status !== RegistrationStatus.COMPLETED) {
    throw new BadRequestException(
      'Ticket can be generated only after completion',
    );
  }

  const event = await this.eventModel.findById(reg.eventId);
  if (!event) {
    throw new NotFoundException('Event not found');
  }

  // ===============================
  // 🔳 QR CODE
  // ===============================
  const qrCode = await this.qrService.generateQr({
    registrationId: reg._id.toString(),
    registrationNumber: reg.registrationNumber!,
    eventId: event._id.toString(),
  });

  // ===============================
  // 💰 READ STORED VALUES (NO MATH)
  // ===============================
  const {
    ticketName,
    basePricePerTicket,
    quantity,
    gstRate,
    gstAmount,
    totalAmount,
  } = reg;

  if (
    basePricePerTicket == null ||
    quantity == null ||
    gstRate == null ||
    gstAmount == null ||
    totalAmount == null
  ) {
    throw new BadRequestException(
      'Invoice data missing in registration',
    );
  }

  // ===============================
  // 📄 PDF — DISPLAY ONLY
  // ===============================
  const pdfBuffer =
    await this.pdfService.generateTicketPdfBuffer({
      userName: reg.userName,
      eventTitle: event.title,
      venue: event.location,
      eventDate: event.startDate,
      registrationNumber: reg.registrationNumber!,

      ticketName,
      basePricePerTicket,
      quantity,
      gstRate,
      gstAmount,
      totalAmount,

      qrCode,
    });

  // ===============================
  // 📧 EMAIL
  // ===============================
  const html = ticketConfirmationTemplate({
    userName: reg.userName,
    eventTitle: event.title,
    eventDate: event.startDate.toDateString(),
    venue: event.location,
    ticketName,
    quantity,
    totalAmount,
    registrationNumber: reg.registrationNumber!,
  });

  await this.emailService.sendTicketEmail({
    to: reg.userEmail,
    subject: `🎟 Your Ticket for ${event.title}`,
    html,
    pdfBuffer,
  });

  await this.registrationModel.findByIdAndUpdate(reg._id, {
    ticketSent: true,
  });
}


  // =====================================================
  // 🎫 GET TICKET (DOWNLOAD PAGE)
  // =====================================================
  async getTicket(registrationId: string) {
    const reg = await this.registrationModel
      .findById(registrationId)
      .populate('eventId')
      .lean();

    if (!reg) return null;

    const event = reg.eventId as any;

    return {
      userName: reg.userName,
      userEmail: reg.userEmail,
      ticketName: reg.ticketName,
      registrationNumber: reg.registrationNumber,
      eventTitle: event.title,
      venue: event.location,
      eventDate: event.startDate,
    };
  }

  // =====================================================
  // ✅ QR VALIDATION AT ENTRY
  // =====================================================
  async verifyQrCode(qrData: string) {
    let payload: any;

    try {
      payload = JSON.parse(qrData);
    } catch {
      return { valid: false, message: 'Invalid QR format' };
    }

    const reg = await this.registrationModel
      .findById(payload.registrationId)
      .populate('eventId');

    if (!reg) {
      return { valid: false, message: 'Invalid ticket' };
    }

    const event = reg.eventId as any;

    return {
      valid: true,
      userName: reg.userName,
      eventTitle: event.title,
      ticketName: reg.ticketName,
      registrationNumber: reg.registrationNumber,
    };
  }

  // =====================================================
  // 🔁 RESEND TICKET EMAIL
  // =====================================================
  async resendTicketEmail(registrationId: string) {
    const reg = await this.registrationModel
      .findById(registrationId)
      .populate('eventId');

    if (!reg) {
      throw new NotFoundException('Registration not found');
    }

    if (reg.status !== RegistrationStatus.COMPLETED) {
      throw new BadRequestException(
        'Ticket not available before payment completion',
      );
    }

    const event =
      reg.eventId instanceof Types.ObjectId
        ? null
        : (reg.eventId as Event);

    if (!event) {
      throw new BadRequestException('Event not found');
    }

    const qrCode = await this.qrService.generateQr({
      registrationId: reg._id.toString(),
      registrationNumber: reg.registrationNumber!,
      eventId: event._id.toString(),
    });

   // inside generateAndSendTicket()

const basePricePerTicket = reg.ticketPrice; // base price (without GST)
const quantity = reg.quantity ?? 1;

// 🔥 GST is already stored in EVENT ticket, so read it
const ticket = event.tickets.find(
  (t: any) => t.name === reg.ticketName,
);

const gstRate = ticket?.gst ?? 0;
const baseTotal = basePricePerTicket * quantity;
const gstAmount = Math.round((baseTotal * gstRate) / 100);
const totalAmount = baseTotal + gstAmount;

const pdfBuffer =
  await this.pdfService.generateTicketPdfBuffer({
    userName: reg.userName,
    eventTitle: event.title,
    venue: event.location,
    eventDate: event.startDate,
    registrationNumber: reg.registrationNumber!,

    ticketName: reg.ticketName,
    basePricePerTicket,
    quantity,
    gstRate,
    gstAmount,
    totalAmount,

    qrCode,
  });


    const html = ticketConfirmationTemplate({
  userName: reg.userName,
  eventTitle: event.title,
  eventDate: event.startDate.toDateString(),
  venue: event.location,
  ticketName: reg.ticketName,
  registrationNumber: reg.registrationNumber!,
  quantity: reg.quantity ?? 1,
  totalAmount: reg.totalAmount!,
});


    await this.emailService.sendTicketEmail({
      to: reg.userEmail,
      subject: `🎟 Your Ticket for ${event.title}`,
      html,
      pdfBuffer,
    });

    return {
      success: true,
      message: 'Ticket email resent successfully',
    };
  }
async getRegistrationsByEvent(eventId: string) {
  return this.registrationModel
    .find({
      eventId: new Types.ObjectId(eventId),
      status: RegistrationStatus.COMPLETED, // ✅ ticket exists
    })
    .sort({ createdAt: -1 })
    .lean();
}


  // =====================================================
  // 🔳 QR FOR DOWNLOAD
  // =====================================================
  async generateQrForDownload(registrationId: string) {
    const reg = await this.registrationModel
      .findById(registrationId)
      .populate('eventId');

    if (!reg) {
      throw new NotFoundException('Registration not found');
    }

    if (!reg.registrationNumber) {
      throw new BadRequestException('Registration incomplete');
    }

    return this.qrService.generateQr({
      registrationId: reg._id.toString(),
      registrationNumber: reg.registrationNumber,
      eventId: (reg.eventId as any)._id.toString(),
    });
  }
}
