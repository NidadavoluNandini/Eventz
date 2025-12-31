import { IsOptional, IsNumber, IsString } from 'class-validator';

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;
}
