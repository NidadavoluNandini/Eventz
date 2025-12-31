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
    const filePath =
      await this.ticketsService.getTicketPdfPath(registrationId);

    if (!filePath) {
      throw new NotFoundException('Ticket not found');
    }

    return res.download(filePath);
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
