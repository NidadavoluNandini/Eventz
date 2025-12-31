import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventStatus } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { MailService } from '../email/mail.service';
@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name)
    private eventModel: Model<Event>,
    private readonly mailService: MailService,
  ) {}

  // Organizer creates event
  async create(dto: CreateEventDto, organizerId: string) {
    // Initialize tickets with available count
    const tickets = dto.tickets.map((ticket) => ({
      ...ticket,
      available: ticket.quantity,
    }));

    const event = await this.eventModel.create({
      ...dto,
      tickets,
      organizerId: new Types.ObjectId(organizerId),
      status: EventStatus.DRAFT,
    });

    return event;
  }

  // Public - list all published events
  async findAll(filters?: {
    status?: EventStatus;
    category?: string;
    city?: string;
  }) {
    const query: any = {};

    // Default to published events for public access
    if (!filters?.status) {
      query.status = EventStatus.PUBLISHED;
    } else if (filters.status) {
      query.status = filters.status;
    }

    if (filters?.category) {
      query.category = filters.category;
    }

    if (filters?.city) {
      query.city = filters.city;
    }

    return this.eventModel
      .find(query)
      .sort({ startDate: 1, createdAt: -1 })
      .select('-__v');
  }

  // Public - single event
  async findById(id: string) {
    const event = await this.eventModel.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  // UPDATE BY EVENT ID
  async update(id: string, dto: UpdateEventDto) {
    const event = await this.eventModel.findById(id);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // If updating tickets, recalculate available counts
    if (dto.tickets) {
      dto.tickets = dto.tickets.map((ticket) => ({
        ...ticket,
        available: ticket.available || ticket.quantity,
      })) as any;
    }

    Object.assign(event, dto);
    await event.save();

    return event;
  }

  // DELETE BY EVENT ID
  async delete(id: string) {
    const event = await this.eventModel.findByIdAndDelete(id);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return { message: 'Event deleted successfully' };
  }

  // Organizer events
  findByOrganizer(organizerId: string) {
    return this.eventModel
      .find({
        organizerId: new Types.ObjectId(organizerId),
      })
      .sort({ createdAt: -1 });
  }

  // Publish event
  async publishEvent(id: string) {
    const event = await this.eventModel.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    event.status = EventStatus.PUBLISHED;
    await event.save();

    return { message: 'Event published successfully', event };
  }

  // Unpublish event
  async unpublishEvent(id: string) {
    const event = await this.eventModel.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    event.status = EventStatus.UNPUBLISHED;
    await event.save();

    return { message: 'Event unpublished successfully', event };
  }

  // Mark event as completed
  async markCompleted(id: string) {
    const event = await this.eventModel.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    event.status = EventStatus.COMPLETED;
    await event.save();

    return { message: 'Event marked as completed', event };
  }
}

