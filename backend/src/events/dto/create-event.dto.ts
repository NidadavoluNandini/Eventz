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
  quantity?: number;  // ✅ ADDED

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
  @IsOptional()  // ✅ ADDED
  @IsString()
  type?: string;  // ✅ ADDED

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @IsOptional()  // ✅ ADDED
  @Type(() => Number)
  @IsNumber()
  quantity?: number;  // ✅ ADDED

  @IsOptional()  // ✅ ADDED
  @Type(() => Number)
  @IsNumber()
  available?: number;  // ✅ ADDED

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

  @IsOptional()  // ✅ MAKE OPTIONAL
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];  // ✅ MAKE OPTIONAL

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
