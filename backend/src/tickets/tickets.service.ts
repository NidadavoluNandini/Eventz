import { Injectable } from '@nestjs/common';
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
  // 🎟 GENERATE + EMAIL TICKET (NO STORAGE)
  // =====================================================
  async generateAndSendTicket(reg: Registration) {
    if (reg.ticketSent) return;

    if (reg.status !== RegistrationStatus.COMPLETED) {
      throw new Error('Ticket generation allowed only after completion');
    }

    // ✅ ALWAYS LOAD EVENT
    const event = await this.eventModel.findById(reg.eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    // =============================
    // QR CODE
    // =============================
    const qrCode = await this.qrService.generateQr({
      registrationId: reg._id.toString(),
      registrationNumber: reg.registrationNumber!,
      eventId: event._id.toString(),
    });

    // =============================
    // PDF BUFFER (IN MEMORY)
    // =============================
    const pdfBuffer =
      await this.pdfService.generateTicketPdfBuffer({
        userName: reg.userName,
        eventTitle: event.title,
        venue: event.location,
        eventDate: event.startDate,
        registrationNumber: reg.registrationNumber!,
        ticketType: reg.ticketType,
        qrCode,
        amount: reg.ticketPrice * reg.quantity,
      });

    // =============================
    // EMAIL HTML
    // =============================
    const html = ticketConfirmationTemplate({
      userName: reg.userName,
      eventTitle: event.title,
      eventDate: event.startDate.toDateString(),
      venue: event.location,
      ticketType: reg.ticketType,
      registrationNumber: reg.registrationNumber!,
    });

    // =============================
    // SEND EMAIL
    // =============================
    await this.emailService.sendTicketEmail({
      to: reg.userEmail,
      subject: `🎟 Your Ticket for ${event.title}`,
      html,
      pdfBuffer,
    });

    // =============================
    // MARK AS SENT
    // =============================
    await this.registrationModel.findByIdAndUpdate(reg._id, {
      qrCode,
      ticketSent: true,
    });
  }

  // =====================================================
  // 🎫 GET TICKET FOR DOWNLOAD PAGE
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
      ticketType: reg.ticketType,
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
      ticketType: reg.ticketType,
      registrationNumber: reg.registrationNumber,
    };
  }
}
