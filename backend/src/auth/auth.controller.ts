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





  // =======================
  // ORGANIZER – PASSWORD AUTH
  // =======================

  @Post('organizer/register')
  registerOrganizer(@Body() dto: RegisterOrganiserDto) {
    return this.authService.registerOrganizer(dto);
  }

  @Post('organizer/login')
  loginOrganizer(@Body() dto: LoginDto) {
    return this.authService.loginOrganizer(dto);
  }

  // =======================
// ORGANIZER – ACCOUNT MGMT
// =======================

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
  // JWT is stateless → frontend deletes token
  return { message: 'Logged out successfully' };
}

@Post('organizer/delete-account')
deleteAccount(@Body('organizerId') organizerId: string) {
  return this.authService.deleteOrganizerAccount(organizerId);
}
@UseGuards(JwtAuthGuard)
@Post('organizer/change-password')
changePassword(
  @Req() req,
  @Body() body: {
    currentPassword: string;
    newPassword: string;
  },
) {
  return this.authService.changeOrganizerPassword(
    req.user.sub,
    body.currentPassword,
    body.newPassword,
  );
}

}
