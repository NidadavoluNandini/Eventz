import { IsMongoId, IsString, IsNumber } from 'class-validator';

export class CreateOrderDto {
  @IsMongoId()
  eventId: string;

  @IsString()
  ticketType: string;

  @IsNumber()
  quantity: number;

  @IsString()
  userPhone: string;
  @IsNumber()
  amount: number;
}
