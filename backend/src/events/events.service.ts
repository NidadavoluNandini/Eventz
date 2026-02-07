// events/events.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventStatus } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
  ) {}

  // ✅ HELPER: Check and auto-complete expired events
  private async autoCompleteExpiredEvents() {
    const now = new Date();
    
    const expiredEvents = await this.eventModel.find({
      status: { $in: [EventStatus.PUBLISHED, EventStatus.UNPUBLISHED] },
      endDate: { $lt: now }, // End date has passed
    });

    for (const event of expiredEvents) {
      event.status = EventStatus.COMPLETED;
      event.registrationOpen = false;
      await event.save();
    }
  }

  // ✅ CREATE EVENT
  async create(dto: CreateEventDto, organizerId: string) {
    const event = new this.eventModel({
      ...dto,
      organizerId: new Types.ObjectId(organizerId),
      status: EventStatus.DRAFT,
      registrationOpen: false,
    });
    return event.save();
  }

  // ✅ FIND ALL PUBLIC EVENTS
// ✅ FIND ALL PUBLIC EVENTS
async findAll(filters?: { status?: EventStatus; category?: string; city?: string }) {
  await this.autoCompleteExpiredEvents();

  const query: any = {
    status: EventStatus.PUBLISHED,   // 👈 keep only status filter
  };

  if (filters?.category) query.category = filters.category;
  if (filters?.city) query.city = filters.city;

  return this.eventModel.find(query).sort({ createdAt: -1 });
}



  // ✅ FIND BY ORGANIZER
  async findByOrganizer(organizerId: string) {
    // Auto-complete expired events first
    await this.autoCompleteExpiredEvents();

    
    const events = await this.eventModel
      .find({
        $or: [
          { organizerId: organizerId },
          { organizerId: new Types.ObjectId(organizerId) }
        ]
      })
      .sort({ createdAt: -1 });
    
    
    return events;
  }

  // ✅ FIND BY ID
  async findById(id: string) {
    const event = await this.eventModel.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if event should be auto-completed
    const now = new Date();
    if (
      event.endDate < now &&
      event.status !== EventStatus.COMPLETED &&
      event.status !== EventStatus.DRAFT
    ) {
      event.status = EventStatus.COMPLETED;
      event.registrationOpen = false;
      await event.save();
    }

    return event;
  }

  // ✅ UPDATE EVENT
  async update(id: string, dto: UpdateEventDto) {
    const event = await this.eventModel.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    Object.assign(event, dto);
    return event.save();
  }

  // ✅ PUBLISH EVENT
  async publishEvent(id: string) {
    const event = await this.eventModel.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if event has already ended
    const now = new Date();
    if (event.endDate < now) {
      throw new ForbiddenException('Cannot publish an event that has already ended');
    }

    event.status = EventStatus.PUBLISHED;
    event.registrationOpen = true;
    return event.save();
  }

  // ✅ UNPUBLISH EVENT
  async unpublishEvent(id: string) {
    const event = await this.eventModel.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    event.status = EventStatus.UNPUBLISHED;
    event.registrationOpen = false;
    return event.save();
  }

  // ✅ MOVE TO DRAFT
  async moveToDraft(id: string) {
    const event = await this.eventModel.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    event.status = EventStatus.DRAFT;
    event.registrationOpen = false;
    return event.save();
  }

  // ✅ CLOSE REGISTRATION
  async closeRegistration(id: string, organizerId: string) {
    const event = await this.eventModel.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const eventOrgId = event.organizerId.toString();
    if (eventOrgId !== organizerId) {
      throw new ForbiddenException('Not authorized');
    }

    event.registrationOpen = false;
    return event.save();
  }

  // ✅ OPEN REGISTRATION
  async openRegistration(id: string, organizerId: string) {
    const event = await this.eventModel.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const eventOrgId = event.organizerId.toString();
    if (eventOrgId !== organizerId) {
      throw new ForbiddenException('Not authorized');
    }

    if (event.status !== EventStatus.PUBLISHED) {
      throw new ForbiddenException('Event must be published first');
    }

    // Check if event has ended
    const now = new Date();
    if (event.endDate < now) {
      throw new ForbiddenException('Cannot open registration for an event that has ended');
    }

    event.registrationOpen = true;
    return event.save();
  }

  // ✅ MARK COMPLETED (Manual override - rarely used)
  async markCompleted(id: string) {
    const event = await this.eventModel.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    event.status = EventStatus.COMPLETED;
    event.registrationOpen = false;
    return event.save();
  }

  // ✅ DELETE EVENT
  async delete(id: string) {
    const event = await this.eventModel.findByIdAndDelete(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return { message: 'Event deleted successfully' };
  }
}
