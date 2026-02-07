// src/events/schemas/event.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

/* =====================================================
   SUB TICKET (no GST)
   ==================================================== */
@Schema({ _id: false })
export class SubTicket {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 0 })
  quantity?: number;

  // finalPrice can just mirror price; keep if you want analytics
  @Prop({ required: true })
  finalPrice: number;
}
export const SubTicketSchema = SchemaFactory.createForClass(SubTicket);

/* =====================================================
   MAIN TICKET
   ==================================================== */
@Schema()
export class Ticket {
  @Prop()
  type?: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop()
  price?: number;

  @Prop({ default: 0 })
  quantity?: number;

  @Prop({ default: 0 })
  available?: number;

  @Prop()
  gst?: number;

  @Prop()
  finalPrice?: number;

  @Prop({ default: true })
  gstIncluded?: boolean;

  @Prop({ type: [SubTicketSchema], default: [] })
  subTickets: SubTicket[];
}
export const TicketSchema = SchemaFactory.createForClass(Ticket);

/* =====================================================
   THEME COLOR
   ==================================================== */
@Schema({ _id: false })
export class ThemeColor {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  value: string;

  @Prop()
  class?: string;
}
export const ThemeColorSchema = SchemaFactory.createForClass(ThemeColor);

/* =====================================================
   EVENT
   ==================================================== */
export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  UNPUBLISHED = 'UNPUBLISHED',
  COMPLETED = 'COMPLETED',
  EDITING = 'EDITING',
}

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  startTime: string; // "HH:MM"

  @Prop({ required: true })
  endTime: string; // "HH:MM"

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  category: string;

  // Hero banner image (optional, S3 URL)
  @Prop()
  bannerImageUrl?: string;

  // Other gallery images (S3 URLs)
  @Prop({ type: [String], default: [] })
  mediaUrls: string[];

  @Prop({ type: ThemeColorSchema, default: null })
  themeColor?: ThemeColor;

  @Prop({ type: [TicketSchema], default: [] })
  tickets: Ticket[];

  // manual toggle from organizer dashboard
  @Prop({ default: false })
  registrationOpen: boolean;

  @Prop({
    type: String,
    enum: Object.values(EventStatus),
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  @Prop({ type: Types.ObjectId, ref: 'Organizer', required: true })
  organizerId: Types.ObjectId;

  // analytics
  @Prop({ default: 0 })
  totalRevenue: number;

  @Prop({ default: 0 })
  totalRegistrations: number;

  @Prop({ default: 0 })
  totalTicketsSold: number;
}

export type EventDocument = HydratedDocument<Event>;
export const EventSchema = SchemaFactory.createForClass(Event);
