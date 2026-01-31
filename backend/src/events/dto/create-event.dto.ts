import {
  IsString,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class TicketDto {
  @IsString()
  name: string; // FREE / EARLY BIRD / STUDENT PASS / etc.

  @IsNumber()
  price: number; // base price

  @IsNumber()
  gst: number; // GST amount in ₹

  @IsNumber()
  finalPrice: number; // price + gst

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsString()
  location: string;

  @IsString()
  city: string;

  @IsString()
  category: string;

  @IsArray()
  @IsString({ each: true })
  mediaUrls: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketDto)
  tickets: TicketDto[];

  @IsOptional()
  registrationOpen?: boolean;
}
