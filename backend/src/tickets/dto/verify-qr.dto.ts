import { IsString } from 'class-validator';

export class VerifyQrDto {
  @IsString()
  qrData: string;
}
