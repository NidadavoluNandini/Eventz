import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

/* ---------- SUB TICKET ---------- */
@Schema({ _id: false })
export class SubTicket {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 0 })
  quantity?: number;

  @Prop({ required: true })
  finalPrice: number;
}
export const SubTicketSchema = SchemaFactory.createForClass(SubTicket);

/* ---------- MAIN TICKET ---------- */
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

/* ---------- THEME COLOR ---------- */
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

/* ---------- ATTENDEE FIELD CONFIG ---------- */
@Schema({ _id: false })
export class AttendeeFieldConfig {
  @Prop({
    type: Object,
    default: {},
  })
  optional: Record<string, boolean>;   // visible?

  @Prop({
    type: Object,
    default: {},
  })
  required: Record<string, boolean>;   // required?
}

export const AttendeeFieldConfigSchema =
  SchemaFactory.createForClass(AttendeeFieldConfig);

/* ---------- PAYMENT SETTINGS ---------- */
@Schema({ _id: false })
export class PaymentSettings {
  @Prop({ default: false })
  collectPaymentCharges: boolean;


}
export const PaymentSettingsSchema =
  SchemaFactory.createForClass(PaymentSettings);

/* ---------- OTHER ATTENDEES CONFIG ---------- */
@Schema({ _id: false })
export class OtherAttendeesConfig {
  @Prop({ default: false })
  enabled: boolean; // from checkbox

  @Prop({ type: [String], default: [] })
  requiredFields: string[]; // e.g. ['name', 'email', 'phone']
}
export const OtherAttendeesConfigSchema =
  SchemaFactory.createForClass(OtherAttendeesConfig);

/* ---------- EVENT ---------- */
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
  startTime: string;

  @Prop({ required: true })
  endTime: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  category: string;

  @Prop()
  bannerImageUrl?: string;

  @Prop({ type: [String], default: [] })
  mediaUrls: string[];

  @Prop({ type: ThemeColorSchema, default: null })
  themeColor?: ThemeColor;

  @Prop({ type: [TicketSchema], default: [] })
  tickets: Ticket[];

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

@Prop({ type: AttendeeFieldConfigSchema, default: null })
attendeeFieldConfig?: AttendeeFieldConfig;


  @Prop({ type: PaymentSettingsSchema, default: null })
  paymentSettings?: PaymentSettings;

  @Prop({ type: OtherAttendeesConfigSchema, default: null })
  otherAttendeesConfig?: OtherAttendeesConfig;

  @Prop({ default: 0 })
  totalRevenue: number;

  @Prop({ default: 0 })
  totalRegistrations: number;

  @Prop({ default: 0 })
  totalTicketsSold: number;
}

export type EventDocument = HydratedDocument<Event>;
export const EventSchema = SchemaFactory.createForClass(Event);
