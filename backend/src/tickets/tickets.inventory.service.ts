import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ticket } from './schemas/tickets.schema';
import { CreateTicketDto } from './dto/create-tickets.dto';
import { UpdateTicketDto } from './dto/update-tickets.dto';

@Injectable()
export class TicketsInventoryService {
  constructor(
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<Ticket>,
  ) {}

  async create(eventId: string, dto: CreateTicketDto) {
    return this.ticketModel.create({
      eventId: new Types.ObjectId(eventId),
      ...dto,
    });
  }

  async findByEvent(eventId: string) {
    return this.ticketModel.find({
      eventId: new Types.ObjectId(eventId),
    });
  }

  async update(ticketId: string, dto: UpdateTicketDto) {
    const ticket = await this.ticketModel.findByIdAndUpdate(
      ticketId,
      dto,
      { new: true },
    );

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async delete(ticketId: string) {
    const ticket = await this.ticketModel.findByIdAndDelete(ticketId);

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return { message: 'Ticket deleted successfully' };
  }
}
