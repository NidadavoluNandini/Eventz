import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterOrganiserDto } from './dto/register-organiser.dto';
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';

import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('organizer/register')
  registerOrganizer(@Body() dto: RegisterOrganiserDto) {
    return this.authService.registerOrganizer(dto);
  }

  @Post('organizer/login')
  loginOrganizer(@Body() dto: LoginDto) {
    return this.authService.loginOrganizer(dto);
  }

  @Post('organizer/send-otp')
  sendOrganizerOtp(@Body('email') email: string) {
    return this.authService.sendOrganizerOtp(email);
  }

  @Post('organizer/verify-otp')
  verifyOrganizerOtp(
    @Body('email') email: string,
    @Body('otp') otp: string,
  ) {
    return this.authService.verifyOrganizerOtp(email, otp);
  }

  @Post('organizer/forgot-password')
  forgotPassword(@Body('email') email: string) {
    return this.authService.organizerForgotPassword(email);
  }

  @Post('organizer/reset-password')
  resetPassword(
    @Body('email') email: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.organizerResetPasswordDirect(
      email,
      newPassword,
    );
  }

  @Post('organizer/logout')
  logout() {
    return { message: 'Logged out successfully' };
  }
}
