import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument, EventStatus } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { MailService } from '../email/mail.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name)
    private eventModel: Model<EventDocument>,
    private readonly mailService: MailService,
  ) {}

async create(dto: CreateEventDto, organizerId: string) {
  console.log('SERVICE DTO:', JSON.stringify(dto, null, 2));

  const event = await this.eventModel.create({
    title: dto.title,
    description: dto.description,
    category: dto.category,
    city: dto.city,
    location: dto.location,

    startDate: new Date(dto.startDate),
    endDate: new Date(dto.endDate),
    startTime: dto.startTime,
    endTime: dto.endTime,

    mediaUrls: dto.mediaUrls ?? [],

    themeColor: dto.themeColor
      ? {
          name: dto.themeColor.name,
          value: dto.themeColor.value,
          class: dto.themeColor.class,
        }
      : undefined,

    tickets: dto.tickets.map((t) => ({
      type: t.type,
      name: t.name,
      description: t.description,
      price: t.price,
      quantity: t.quantity ?? 0,
      available: t.available ?? t.quantity ?? 0,
      gst: t.gst,
      finalPrice: t.finalPrice,
      gstIncluded: t.gstIncluded ?? true,
      subTickets:
        t.subTickets?.map((s) => ({
          name: s.name,
          price: s.price,
          quantity: s.quantity ?? 0,
          gst: s.gst,
          finalPrice: s.finalPrice,
          gstIncluded: s.gstIncluded ?? true,
        })) ?? [],
    })),

    // 🔥 FIX (THIS WAS THE BUG)
    organizerId: new Types.ObjectId(organizerId),

    status: EventStatus.PUBLISHED,
    registrationOpen: true,
  });

  return event;
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
    $or: [
      { organizerId: new Types.ObjectId(organizerId) }, // correct
      { organizerId: organizerId },                     // legacy bad data
    ],
  });
}

}

