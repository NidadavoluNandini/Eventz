import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  NotFoundException,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';

import { TicketsService } from './tickets.service';
import { VerifyQrDto } from './dto/verify-qr.dto';

import PDFDocument from 'pdfkit';

@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
  ) {}

  // ===============================
  // QR VERIFY (ENTRY SCAN)
  // ===============================
  @Post('verify-qr')
  verifyQr(@Body() dto: VerifyQrDto) {
    return this.ticketsService.verifyQrCode(dto.qrData);
  }

  // ===============================
  // DOWNLOAD PDF (DYNAMIC)
  // ===============================
  @Get('download/:registrationId')
  async downloadTicket(
    @Param('registrationId') registrationId: string,
    @Res() res: Response,
  ) {
    const ticket =
      await this.ticketsService.getTicket(registrationId);

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=event-ticket.pdf',
    );

    doc.pipe(res);

    // ===== HEADER =====
    doc
      .fontSize(26)
      .text('🎟 EVENT TICKET', { align: 'center' });

    doc.moveDown(0.5);

    doc
      .fontSize(18)
      .text(ticket.eventTitle, { align: 'center' });

    doc.moveDown();

    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();

    doc.moveDown(2);

    // ===== BODY =====
    doc.fontSize(14);
    doc.text(`Name: ${ticket.userName}`);
    doc.text(`Email: ${ticket.userEmail}`);
    doc.text(`Ticket Type: ${ticket.ticketType}`);
    doc.text(`Registration No: ${ticket.registrationNumber}`);

    doc.moveDown(2);

    doc
      .fontSize(12)
      .text(
        'Please show this ticket at the event entrance.',
        { align: 'center' },
      );

    doc.end();
  }
}
