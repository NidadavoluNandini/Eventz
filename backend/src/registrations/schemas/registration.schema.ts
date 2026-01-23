import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TicketType } from '../../events/schemas/event.schema';

export enum RegistrationStatus {
  PENDING_OTP = 'PENDING_OTP',
  OTP_VERIFIED = 'OTP_VERIFIED',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  NOT_REQUIRED = 'NOT_REQUIRED',
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

@Schema({ timestamps: true })
export class Registration extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  eventId: Types.ObjectId;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  userEmail: string;

  @Prop({ required: true })
  userPhone: string;

  @Prop({ enum: Object.values(TicketType), required: true })
  ticketType: TicketType;

  @Prop({ required: true })
  ticketPrice: number;

  @Prop({ default: 1 })
  quantity: number;

  @Prop({
    enum: Object.values(RegistrationStatus),
    default: RegistrationStatus.PENDING_OTP,
  })
  status: RegistrationStatus;

  @Prop({
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  // 🔐 OTP
  @Prop()
  otp?: number;

  @Prop()
  otpExpiresAt?: Date;

  @Prop({ default: false })
  otpVerified: boolean;

  // 💳 Payment
  @Prop()
  razorpayOrderId?: string;

  @Prop()
  razorpayPaymentId?: string;

  // 🎟 Ticket
  @Prop()
  qrCode?: string;

  @Prop({ unique: true, sparse: true })
  registrationNumber?: string;

  @Prop({ default: false })
  ticketSent: boolean;

  // 🔔 Payment reminders
  @Prop({ default: 0 })
  paymentReminderCount: number;

  @Prop()
  lastPaymentReminderAt?: Date;
  @Prop()
ticketUrl?: string;

// ⏳ auto-expiry
@Prop()
expiresAt?: Date;


}

export const RegistrationSchema =
  SchemaFactory.createForClass(Registration);

// Indexes
RegistrationSchema.index({ eventId: 1, userEmail: 1 });
RegistrationSchema.index({ eventId: 1, userPhone: 1 });
