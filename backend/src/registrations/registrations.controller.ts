import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('registrations')
export class RegistrationsController {
  constructor(
    private readonly registrationsService: RegistrationsService,
  ) {}

  // =====================================================
  // PUBLIC – INITIATE REGISTRATION
  // =====================================================
@Post('initiate')
initiateRegistration(
  @Body()
  dto: {
    eventId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    ticketName: string;
    subTicketName?: string; // ✅ ADD THIS

    quantity: number; // ✅ ADD THIS
  },
) {
  return this.registrationsService.initiateRegistration(dto);
}


  // =====================================================
  // PUBLIC – VERIFY OTP
  // =====================================================
  @Post('verify-otp')
  verifyOtp(
    @Body()
    dto: {
      registrationId: string;
      otp: number;
    },
  ) {
    return this.registrationsService.verifyOtp(
      dto.registrationId,
      dto.otp,
    );
  }

  @Post('resend-otp')
  resendOtp(@Body('registrationId') registrationId: string) {
    return this.registrationsService.resendOtp(registrationId);
  }

  // =====================================================
  // ORGANIZER – EVENT REGISTRATIONS
  // =====================================================
  @Get('event/:eventId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  getEventRegistrations(
    @Param('eventId') eventId: string,
    @Req() req,
  ) {
    return this.registrationsService.findByEvent(
      eventId,
      req.user.userId,
    );
  }

  // =====================================================
  // PUBLIC – USER REGISTRATIONS
  // =====================================================
  @Get('user/:phone')
  getUserRegistrations(@Param('phone') phone: string) {
    return this.registrationsService.findByUser(phone);
  }

  // =====================================================
  // PAYMENT COMPLETE
  // =====================================================
  @Post('complete')
  completeRegistration(@Body() dto: {
    registrationId: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
  }) {
    return this.registrationsService.completeRegistration(
      dto.registrationId,
      {
        razorpayOrderId: dto.razorpayOrderId,
        razorpayPaymentId: dto.razorpayPaymentId,
      },
    );
  }

  @Post('payment-cancelled')
  markPaymentCancelled(
    @Body('registrationId') registrationId: string,
  ) {
    return this.registrationsService.markPaymentCancelled(
      registrationId,
    );
  }

  @Get(':id')
  getRegistration(@Param('id') id: string) {
    return this.registrationsService.findById(id);
  }

   @Get("events/:eventId/attendees")
  async getEventAttendees(@Param("eventId") eventId: string) {
    return this.registrationsService.getAttendeesByEvent(eventId);
  }

  @Get(':id/status')
getStatus(@Param('id') id: string) {
  return this.registrationsService.getRegistrationStatus(id);
}

}
