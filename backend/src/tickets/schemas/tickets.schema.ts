import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Ticket {
  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  eventId: Types.ObjectId;

  @Prop({ required: true })
  type: string; // REGULAR, VIP, Early Bird, Free etc.

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  quantity: number;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
