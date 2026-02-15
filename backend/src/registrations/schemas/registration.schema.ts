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

  // Optional attendee extra fields (controlled by event.attendeeFieldConfig.optional)
  @Prop()
  linkedin?: string;

  @Prop()
  gender?: string;

  @Prop()
  altPhone?: string;

  @Prop()
  altEmail?: string;

  @Prop()
  dob?: Date;

  @Prop()
  country?: string;

  @Prop()
  state?: string;

  @Prop()
  postalCode?: string;

  @Prop()
  organization?: string;

  @Prop()
  designation?: string;



  @Prop()
  tShirtSize?: string;

  @Prop()
  emergencyContactName?: string;

  @Prop()
  emergencyContactPhone?: string;

  // ===============================
  // TICKET INFO
  // ===============================
  @Prop({ required: true })
  ticketName: string; // Free, Early Bird, VIP

  @Prop()
  subTicketName?: string;

  @Prop({ required: true })
  basePricePerTicket: number;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  gstRate: number;

  @Prop({ required: true })
  gstAmount: number;

  @Prop({ required: true })
  totalAmount: number; // final: base + GST + platform

  // ⚠️ KEEP for backward compatibility
  @Prop({ required: true })
  ticketPrice: number; // per-ticket final or legacy total

 //NEW: total platform fee for this registration
@Prop({ default: 0 })
platformFee: number;

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
  @Prop({
  type: [
    {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
  ],
  default: [],
})
otherAttendees?: { name: string; email: string; phone: string }[];

}

export const RegistrationSchema =
  SchemaFactory.createForClass(Registration);
