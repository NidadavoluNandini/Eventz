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
    private readonly qrService: QrService,
    private readonly pdfService: PdfService,
    private readonly emailService: EmailService,
  ) {}

  // =====================================================
  // 🎟 GENERATE + SEND TICKET (SAFE + HTML)
  // =====================================================
async generateAndSendTicket(reg: Registration) {
  // 🔒 prevent duplicate emails
  if (reg.ticketSent) {
    return;
  }

  if (reg.status !== RegistrationStatus.COMPLETED) {
    throw new Error('Ticket can only be generated after completion');
  }

  const event =
    reg.eventId instanceof Types.ObjectId
      ? null
      : (reg.eventId as Event);

  if (!event) {
    throw new Error('Event not populated');
  }

  // 🔳 QR CODE
  const qrCode = await this.qrService.generateQr({
    registrationId: reg._id.toString(),
    registrationNumber: reg.registrationNumber!,
    eventId: event._id.toString(),
  });

  // 📄 PDF BUFFER (NO FILE SYSTEM)
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

  // 🎨 HTML EMAIL
  const html = ticketConfirmationTemplate({
    userName: reg.userName,
    eventTitle: event.title,
    eventDate: event.startDate.toDateString(),
    venue: event.location,
    ticketType: reg.ticketType,
    registrationNumber: reg.registrationNumber!,
  });

  // 📧 SEND EMAIL
  await this.emailService.sendTicketEmail({
    to: reg.userEmail,
    subject: `🎟 Your Ticket for ${event.title}`,
    html,
    pdfBuffer,
  });

  // 💾 UPDATE DATABASE
  await this.registrationModel.findByIdAndUpdate(reg._id, {
    qrCode,
    ticketSent: true,
  });
}


  async getTicketData(registrationId: string) {
    return this.registrationModel
      .findById(registrationId)
      .populate('eventId')
      .lean();
  }


  // =====================================================
  // REQUIRED BY CONTROLLER
  // =====================================================
  async getTicketPdfPath(registrationId: string) {
    const reg = await this.registrationModel.findById(registrationId);
    return reg?.ticketUrl ?? null;
  }

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

    if (!reg) return { valid: false, message: 'Invalid ticket' };

    const event =
      reg.eventId instanceof Types.ObjectId
        ? null
        : (reg.eventId as Event);

    return {
      valid: true,
      userName: reg.userName,
      eventTitle: event?.title,
      ticketType: reg.ticketType,
      registrationNumber: reg.registrationNumber,
    };
  }
}
