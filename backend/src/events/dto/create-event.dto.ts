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

/* ---------- ATTENDEE FIELD CONFIG DTO ---------- */
class AttendeeFieldConfigDto {
  @IsOptional()
  @IsObject()
  optional?: Record<string, boolean>;

  @IsOptional()
  @IsObject()
  required?: Record<string, boolean>;
}


/* ---------- PAYMENT SETTINGS DTO ---------- */
class PaymentSettingsDto {
  @IsOptional()
  @IsBoolean()
  collectPaymentCharges?: boolean;


}

/* ---------- OTHER ATTENDEES CONFIG DTO ---------- */
class OtherAttendeesConfigDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredFields?: string[]; // e.g. ['name','email','phone']
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

  @IsOptional()
  @IsString()
  bannerImageUrl?: string;

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

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AttendeeFieldConfigDto)
  attendeeFieldConfig?: AttendeeFieldConfigDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PaymentSettingsDto)
  paymentSettings?: PaymentSettingsDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => OtherAttendeesConfigDto)
  otherAttendeesConfig?: OtherAttendeesConfigDto;
}
