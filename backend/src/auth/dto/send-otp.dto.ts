import { IsString, Length } from 'class-validator';

export class SendOtpDto {
  @IsString()
  @Length(10, 10)
  phone: string;
}
