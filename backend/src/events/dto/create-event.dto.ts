// src/events/dto/create-event.dto.ts
import {
  IsString,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

/* ---------- SUB-TICKET DTO ---------- */
class SubTicketDto {
  @IsString()
  name: string;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  gst?: number;

  @Type(() => Number)
  @IsNumber()
  finalPrice: number;

  @IsOptional()
  @IsBoolean()
  gstIncluded?: boolean;
}

/* ---------- MAIN TICKET DTO ---------- */
class TicketDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  available?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  gst?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  finalPrice?: number;

  @IsOptional()
  @IsBoolean()
  gstIncluded?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubTicketDto)
  subTickets?: SubTicketDto[];
}

/* ---------- THEME COLOR DTO ---------- */
class ThemeColorDto {
  @IsString()
  name: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  class?: string;
}

/* ---------- CREATE EVENT DTO ---------- */
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

  // Hero banner (S3 URL, optional)
  @IsOptional()
  @IsString()
  bannerImageUrl?: string;

  // Gallery images (S3 URLs, optional)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ThemeColorDto)
  themeColor?: ThemeColorDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketDto)
  tickets: TicketDto[];

  @IsOptional()
  @IsBoolean()
  registrationOpen?: boolean;
}
