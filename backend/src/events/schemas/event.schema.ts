import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

/* =====================================================
   SUB TICKET (NO _id — embedded only)
   ===================================================== */
/* =====================================================
   SUB TICKET (NO _id — embedded only)
   ===================================================== */
@Schema({ _id: false })
export class SubTicket {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 0 })  // ✅ ADDED
  quantity?: number;

  @Prop()
  gst?: number;

  @Prop({ required: true })
  finalPrice: number;

  @Prop({ default: true })
  gstIncluded?: boolean;
}
export const SubTicketSchema = SchemaFactory.createForClass(SubTicket);

/* =====================================================
   MAIN TICKET (🔥 MUST HAVE _id)
   ===================================================== */
@Schema()
export class Ticket {
  @Prop()  // ✅ ADDED
  type?: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop()
  price?: number;

  @Prop({ default: 0 })  // ✅ ADDED
  quantity?: number;

  @Prop({ default: 0 })  // ✅ ADDED
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
   ===================================================== */
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
   ===================================================== */
export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  UNPUBLISHED = 'UNPUBLISHED',
  COMPLETED = 'COMPLETED',
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

  @Prop({ type: ThemeColorSchema, default: null })
  themeColor?: ThemeColor;

  @Prop({ type: [TicketSchema], default: [] })
  tickets: Ticket[];

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
}

export type EventDocument = HydratedDocument<Event>;
export const EventSchema = SchemaFactory.createForClass(Event);
