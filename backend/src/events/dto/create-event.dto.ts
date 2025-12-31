import {
  IsString,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TicketType } from '../schemas/event.schema';

class TicketDto {
  @IsEnum(TicketType)
  type: TicketType;

  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  available?: number;

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
  mediaUrls: string[]; // ✅ NEW

  @IsNumber()
  capacity: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketDto)
  tickets: TicketDto[];
}
