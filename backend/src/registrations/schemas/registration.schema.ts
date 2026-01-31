import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum RegistrationStatus {
  PENDING_OTP = 'PENDING_OTP',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  NOT_REQUIRED = 'NOT_REQUIRED',
  FAILED = 'FAILED',
}

@Schema({ timestamps: true })
export class Registration extends Document {
  // ===============================
  // EVENT + USER
  // ===============================
  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  eventId: Types.ObjectId;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  userEmail: string;

  @Prop()
  userPhone: string;

  // ===============================
  // TICKET INFO
  // ===============================
  @Prop({ required: true })
  ticketName: string; // Free, Early Bird, VIP

  @Prop({ required: true })
  basePricePerTicket: number; // 👈 ₹200

  @Prop({ required: true })
  quantity: number; // 👈 10

  @Prop({ required: true })
  gstRate: number; // 👈 18

  @Prop({ required: true })
  gstAmount: number; // 👈 ₹360 (TOTAL GST)

  @Prop({ required: true })
  totalAmount: number; // 👈 ₹2360 (FINAL PAYABLE)

  // ⚠️ KEEP for backward compatibility
  @Prop({ required: true })
  ticketPrice: number; // SAME as totalAmount (DO NOT recompute)

  // ===============================
  // OTP
  // ===============================
  @Prop()
  otp?: number;

  @Prop()
  otpExpiresAt?: Date;

  @Prop({ default: false })
  otpVerified: boolean;

  // ===============================
  // STATUS
  // ===============================
  @Prop({
    type: String,
    enum: Object.values(RegistrationStatus),
    default: RegistrationStatus.PENDING_OTP,
  })
  status: RegistrationStatus;

  @Prop({
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  // ===============================
  // PAYMENT
  // ===============================
  @Prop()
  registrationNumber?: string;

  @Prop()
  razorpayPaymentId?: string;

  @Prop()
  razorpayOrderId?: string;

  // ===============================
  // TICKET DELIVERY
  // ===============================
  @Prop({ default: false })
  ticketSent: boolean;
}

export const RegistrationSchema =
  SchemaFactory.createForClass(Registration);
