import { IsEmail, IsOptional, MinLength } from 'class-validator';

export class UpdateOrganizerDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;
}
