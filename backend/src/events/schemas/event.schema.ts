import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum TicketType {
  FREE = 'FREE',
  EARLY_BIRD = 'EARLY_BIRD',
  REGULAR = 'REGULAR',
  VIP = 'VIP',
}

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  UNPUBLISHED = 'UNPUBLISHED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
}

@Schema({ timestamps: true })
export class Event extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  endTime: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  category: string;

  // 🎥 Multimedia (images, videos, gifs)
  @Prop({ type: [String], default: [] })
  mediaUrls: string[];

  // 👥 Max members / attendees
  @Prop({ required: true })
  capacity: number;

  // 🎟 Ticket allocations
  @Prop({
    type: [
      {
        type: {
          type: String,
          enum: Object.values(TicketType),
        },
        name: String,
        price: Number,
        quantity: Number,
        available: Number,
        description: String,
      },
    ],
    default: [],
  })
  tickets: {
    type: TicketType;
    name: string;
    price: number;
    quantity: number;
    available: number;
    description?: string;
  }[];

  // 📌 Event status
  @Prop({
    type: String,
    enum: Object.values(EventStatus),
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  // 🧑‍💼 Organizer
  @Prop({ type: Types.ObjectId, ref: 'Organizer', required: true })
  organizerId: Types.ObjectId;

  // 📊 Analytics
  @Prop({ type: Number, default: 0 })
  totalRegistrations: number;

  @Prop({ type: Number, default: 0 })
  totalRevenue: number;
}

export const EventSchema = SchemaFactory.createForClass(Event);
