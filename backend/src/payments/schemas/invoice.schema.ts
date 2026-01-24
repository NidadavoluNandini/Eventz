import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Invoice extends Document {
  @Prop()
  invoiceNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Registration' })
  registrationId: Types.ObjectId;

  @Prop()
  userName: string;

  @Prop()
  userEmail: string;

  @Prop()
  eventTitle: string;

  @Prop()
  quantity: number;

  @Prop()
  unitPrice: number;

  @Prop()
  totalAmount: number;

  // ✅ NOT REQUIRED ANYMORE
  @Prop()
  pdfPath?: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
