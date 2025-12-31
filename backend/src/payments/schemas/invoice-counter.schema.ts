import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'invoice_counters' })
export class InvoiceCounter extends Document {
  @Prop({ required: true, unique: true })
  year: number;

  @Prop({ default: 0 })
  seq: number;
}

export const InvoiceCounterSchema =
  SchemaFactory.createForClass(InvoiceCounter);
