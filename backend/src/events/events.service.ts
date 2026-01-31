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

  async create(dto: CreateEventDto, organizerId: string) {
    return this.eventModel.create({
      ...dto,
      organizerId: new Types.ObjectId(organizerId),
      registrationOpen: true,
      status: EventStatus.DRAFT,
    });
  }

async findAll(filters?: {
  status?: EventStatus;
  category?: string;
  city?: string;
}) {
  const query: any = {};

  // ✅ Show both published & unpublished to users
  if (filters?.status) {
    query.status = filters.status;
  } else {
    query.status = {
      $in: [EventStatus.PUBLISHED, EventStatus.UNPUBLISHED],
    };
  }

  if (filters?.category) query.category = filters.category;
  if (filters?.city) query.city = filters.city;

  return this.eventModel.find(query).sort({ startDate: 1 });
}

  async findById(id: string) {
    const event = await this.eventModel.findById(id);
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: string, dto: UpdateEventDto) {
    const event = await this.eventModel.findById(id);
    if (!event) throw new NotFoundException('Event not found');

    Object.assign(event, dto);
    return event.save();
  }

  async moveToDraft(id: string) {
    return this.eventModel.findByIdAndUpdate(
      id,
      {
        status: EventStatus.DRAFT,
        registrationOpen: false,
      },
      { new: true },
    );
  }

  async delete(id: string) {
    const event = await this.eventModel.findByIdAndDelete(id);
    if (!event) throw new NotFoundException('Event not found');
    return { message: 'Event deleted successfully' };
  }

  async publishEvent(id: string) {
    return this.eventModel.findByIdAndUpdate(
      id,
      {
        status: EventStatus.PUBLISHED,
        registrationOpen: true,
      },
      { new: true },
    );
  }

  async unpublishEvent(id: string) {
    return this.eventModel.findByIdAndUpdate(
      id,
      {
        status: EventStatus.UNPUBLISHED,
        registrationOpen: false,
      },
      { new: true },
    );
  }

  async markCompleted(id: string) {
    const event = await this.eventModel.findById(id);
    if (!event) throw new NotFoundException('Event not found');

    event.status = EventStatus.COMPLETED;
    event.registrationOpen = false;
    return event.save();
  }

  async closeRegistration(eventId: string, organizerId: string) {
    const event = await this.eventModel.findOne({
      _id: eventId,
      organizerId: new Types.ObjectId(organizerId),
    });

    if (!event) throw new NotFoundException('Event not found');

    event.registrationOpen = false;
    return event.save();
  }

  async autoCompleteEvents() {
    const now = new Date();

    await this.eventModel.updateMany(
      {
        status: { $ne: EventStatus.COMPLETED },
        endDate: { $lt: now },
      },
      {
        status: EventStatus.COMPLETED,
        registrationOpen: false,
      },
    );
  }

  async findByOrganizer(organizerId: string) {
    await this.autoCompleteEvents();

    return this.eventModel.find({
      organizerId: new Types.ObjectId(organizerId),
    });
  }
}

