// src/tickets/tickets.service.ts
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

import { Event, EventDocument } from '../events/schemas/event.schema';

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

    const event = (await this.eventModel.findById(
      reg.eventId,
    )) as EventDocument | null;

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // 🔳 QR CODE
    const qrCode = await this.qrService.generateQr({
      registrationId: reg._id.toString(),
      registrationNumber: reg.registrationNumber!,
      eventId: event._id.toString(),
    });

    // 💰 READ STORED VALUES (NO MATH)
    const {
      ticketName,
      basePricePerTicket,
      quantity,
      gstRate,
      gstAmount,
      totalAmount,
      platformFee,
      platformPercent,
      otherAttendees,
      subTicketName,
    } = reg as any;

    if (
      basePricePerTicket == null ||
      quantity == null ||
      gstRate == null ||
      gstAmount == null ||
      totalAmount == null
    ) {
      throw new BadRequestException('Invoice data missing in registration');
    }

    const pdfBuffer = await this.pdfService.generateTicketPdfBuffer({
      userName: reg.userName,
      eventTitle: event.title,
      venue: event.location,
      eventDate: event.startDate,
      registrationNumber: reg.registrationNumber!,

      ticketName,
      subTicketName: subTicketName || undefined,
      basePricePerTicket,
      quantity,
      gstRate,
      gstAmount,
      totalAmount,
      platformFee,
      platformPercent,
      qrCode,
      otherAttendees: otherAttendees || [],
    });

    await this.emailService.sendTicketEmail({
      to: reg.userEmail,
      eventName: event.title,
      userName: reg.userName,
      ticketType: ticketName,
      registrationNumber: reg.registrationNumber!,
      eventDate: event.startDate.toDateString(),
      eventTime: `${event.startTime} - ${event.endTime}`,
      eventLocation: event.location,
      quantity: reg.quantity || 1,
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

    const event = (await this.eventModel.findById(
      reg.eventId,
    )) as EventDocument | null;

    if (!event) {
      throw new BadRequestException('Event not found');
    }

    const qrCode = await this.qrService.generateQr({
      registrationId: reg._id.toString(),
      registrationNumber: reg.registrationNumber!,
      eventId: event._id.toString(),
    });

    const basePricePerTicket =
      (reg as any).basePricePerTicket ?? reg.ticketPrice;
    const quantity = reg.quantity ?? 1;

    const ticket = event.tickets.find(
      (t: any) => t.name === reg.ticketName,
    );

    const gstRate = (reg as any).gstRate ?? ticket?.gst ?? 0;
    const baseTotal = basePricePerTicket * quantity;
    const gstAmount =
      (reg as any).gstAmount ??
      Math.round((baseTotal * gstRate) / 100);

    const platformPercent =
      (reg as any).platformPercent ??
      (event.paymentSettings?.collectPaymentCharges
        ? event.paymentSettings.platformFeePercent ?? 0
        : 0);

    const platformFee =
      (reg as any).platformFee ??
      Math.round(((baseTotal + gstAmount) * platformPercent) / 100);

    const totalAmount =
      reg.totalAmount ?? baseTotal + gstAmount + platformFee;
const pdfBuffer = await this.pdfService.generateTicketPdfBuffer({
  userName: reg.userName,
  eventTitle: event.title,
  venue: event.location,
  eventDate: event.startDate,
  registrationNumber: reg.registrationNumber!,

  ticketName: reg.ticketName,
  subTicketName: (reg as any).subTicketName || undefined,
  basePricePerTicket,
  quantity,
  gstRate,
  gstAmount,
  totalAmount,
  platformFee,
  platformPercent,
  qrCode,
  otherAttendees: (reg as any).otherAttendees || [],
});

const html = ticketConfirmationTemplate({
  userName: reg.userName,
  eventTitle: event.title,
  eventDate: event.startDate.toDateString(),
  venue: event.location,
  ticketName: reg.ticketName,
  registrationNumber: reg.registrationNumber!,
  quantity: reg.quantity ?? 1,
  totalAmount,
});

// use the same helper as generateAndSendTicket
await this.emailService.sendTicketEmail({
  to: reg.userEmail,
  eventName: event.title,
  userName: reg.userName,
  ticketType: reg.ticketName,
  registrationNumber: reg.registrationNumber!,
  eventDate: event.startDate.toDateString(),
  eventTime: `${event.startTime} - ${event.endTime}`,
  eventLocation: event.location,
  quantity: reg.quantity ?? 1,
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
        status: RegistrationStatus.COMPLETED,
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
