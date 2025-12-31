import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterOrganiserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4)
  password: string;

  @IsString()
  name: string;
}
