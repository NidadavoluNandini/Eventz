import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  UNPUBLISHED = 'UNPUBLISHED',
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

  @Prop({ type: [String], default: [] })
  mediaUrls: string[];

  // 🎟 Flexible ticket types with GST
  @Prop({
    type: [
      {
        name: String,
        price: Number,
        gst: Number,
        finalPrice: Number,
        description: String,
      },
    ],
    default: [],
  })
  tickets: {
    name: string;
    price: number;
    gst: number;
    finalPrice: number;
    description?: string;
  }[];

  // 🔓 Manual registration control
  @Prop({ default: true })
  registrationOpen: boolean;

  @Prop({
    type: String,
    enum: Object.values(EventStatus),
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  @Prop({ type: Types.ObjectId, ref: 'Organizer', required: true })
  organizerId: Types.ObjectId;

  // 📊 Analytics
  @Prop({ type: Number, default: 0 })
  totalRegistrations: number;

  @Prop({ type: Number, default: 0 })
  totalRevenue: number;
}

export const EventSchema = SchemaFactory.createForClass(Event);
