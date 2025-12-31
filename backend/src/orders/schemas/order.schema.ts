import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  eventId: Types.ObjectId;

  @Prop({ required: true })
  userPhone: string;

  @Prop({ required: true })
  amount: number;

  @Prop({
    enum: ['PENDING', 'PAID', 'FAILED'],
    default: 'PENDING',
  })
  status: string;

  // Razorpay fields (IMPORTANT)
  @Prop()
  razorpayOrderId?: string;

  @Prop()
  razorpayPaymentId?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
