import { IsOptional, IsString, IsEmail } from 'class-validator';

export class UpdateOrganizerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  photo?: string; // ✅ REQUIRED
}
