import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OtherAttendeeDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  phone: string;
}

export class OtherAttendeesDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OtherAttendeeDto)
  otherAttendees?: OtherAttendeeDto[];
}
