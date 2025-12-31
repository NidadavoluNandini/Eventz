import { IsString, IsNumber } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  phone: string;

  @IsNumber()
  otp: number;
}
