import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Organizer extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  name: string;

  @Prop({ default: 'ORGANIZER' })
  role: string;
  @Prop()
passwordResetToken?: string;

@Prop()
passwordResetExpires?: Date;

}

export const OrganizerSchema = SchemaFactory.createForClass(Organizer);
