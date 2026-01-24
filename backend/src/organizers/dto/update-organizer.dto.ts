import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateOrganizerDto {

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  // optional if you want update password separately
  @IsOptional()
  @MinLength(6)
  password?: string;
}
