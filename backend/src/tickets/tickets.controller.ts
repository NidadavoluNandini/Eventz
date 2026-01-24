import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  NotFoundException,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { TicketsInventoryService } from './tickets.inventory.service';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-tickets.dto';
import { UpdateTicketDto } from './dto/update-tickets.dto';
import { VerifyQrDto } from './dto/verify-qr.dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import * as PDFDocument from 'pdfkit';

@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly ticketsInventoryService: TicketsInventoryService,
    private readonly ticketsService: TicketsService,
  ) {}

  // ✅ QR VERIFICATION (MUST BE FIRST)
  @Post('verify-qr')
  verifyQr(@Body() dto: VerifyQrDto) {
    return this.ticketsService.verifyQrCode(dto.qrData);
  }

  // 🔐 Organizer creates ticket
  @Post(':eventId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  createTicket(
    @Param('eventId') eventId: string,
    @Body() dto: CreateTicketDto,
  ) {
    return this.ticketsInventoryService.create(eventId, dto);
  }

  // ✅ Public – tickets for event
  @Get('event/:eventId')
  getTickets(@Param('eventId') eventId: string) {
    return this.ticketsInventoryService.findByEvent(eventId);
  }
@Get('download/:registrationId')
async downloadTicket(
  @Param('registrationId') registrationId: string,
  @Res() res: Response,
) {
  const ticket: any =
    await this.ticketsService.getTicketData(registrationId);

  if (!ticket) {
    throw new NotFoundException('Ticket not found');
  }

  const doc = new PDFDocument({ size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=ticket.pdf',
  );

  doc.pipe(res);

  doc.fontSize(22).text('🎟 EVENT TICKET', {
    align: 'center',
  });

  doc.moveDown();

  doc.fontSize(14).text(`Name: ${ticket.userName}`);
  doc.text(`Email: ${ticket.userEmail}`);

  // ✅ CAST HERE
  doc.text(
    `Event: ${(ticket.eventId as any)?.title}`,
  );

  doc.text(`Ticket Type: ${ticket.ticketType}`);
  doc.text(
    `Registration No: ${ticket.registrationNumber}`,
  );

  doc.moveDown(2);

  doc
    .fontSize(12)
    .text(
      'Please show this ticket at the event entrance.',
      { align: 'center' },
    );

  doc.end();
}

  // 🔐 Organizer update ticket
  @Put(':ticketId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  updateTicket(
    @Param('ticketId') ticketId: string,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.ticketsInventoryService.update(ticketId, dto);
  }

  // 🔐 Organizer delete ticket
  @Delete(':ticketId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  deleteTicket(@Param('ticketId') ticketId: string) {
    return this.ticketsInventoryService.delete(ticketId);
  }
}
