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
  // PUBLIC – INITIATE REGISTRATION (SEND OTP)
  // =====================================================
  @Post('initiate')
  initiateRegistration(
    @Body()
    dto: {
      eventId: string;
      userName: string;
      userEmail: string;
      userPhone: string;
      ticketType: string;
      quantity: number;
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
    console.log("INITIATE OTP for", dto.registrationId);

    return this.registrationsService.verifyOtp(
      dto.registrationId,
      dto.otp,
    );
  }

  // =====================================================
  // PUBLIC – RESEND OTP
  // =====================================================
  @Post('resend-otp')
  resendOtp(
    @Body()
    dto: {
      registrationId: string;
    },
  ) {
    return this.registrationsService.resendOtp(dto.registrationId);
  }

  // =====================================================
  // ORGANIZER – GET ATTENDEES OF AN EVENT
  // (USER MANAGEMENT PAGE)
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
  // PUBLIC – GET ALL REGISTRATIONS OF A USER
  // (MY TICKETS PAGE)
  // =====================================================
  @Get('user/:phone')
  getUserRegistrations(@Param('phone') phone: string) {
    return this.registrationsService.findByUser(phone);
  }

  // =====================================================
  // PUBLIC – COMPLETE REGISTRATION (AFTER PAYMENT)
  // =====================================================
  @Post('complete')
  completeRegistration(
    @Body()
    dto: {
      registrationId: string;
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
    },
  ) {
    return this.registrationsService.completeRegistration(
      dto.registrationId,
      {
        razorpayOrderId: dto.razorpayOrderId,
        razorpayPaymentId: dto.razorpayPaymentId,
      },
    );
  }

  // =====================================================
  // PUBLIC – GET REGISTRATION BY ID
  // =====================================================
  @Get(':id')
  getRegistration(@Param('id') id: string) {
    return this.registrationsService.findById(id);
  }
  @Post('payment-cancelled')
markPaymentCancelled(
  @Body('registrationId') registrationId: string,
) {
  return this.registrationsService.markPaymentCancelled(
    registrationId,
  );
}

}
