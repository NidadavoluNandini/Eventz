import {
  Controller,
  Post,
  Body,
  Param,
  Headers,
  BadRequestException,
  Req,
  Get,
} from '@nestjs/common';
import { PaymentsIntegrationService } from './payments-integration.service';
import { PaymentsService } from './payments.service';

@Controller('payments/registration')
export class PaymentsController {
  constructor(
    private readonly paymentsIntegrationService: PaymentsIntegrationService,
    private readonly paymentsService: PaymentsService,
  ) {}

  // ✅ CREATE ORDER - Use paymentsService
  @Post('create-order')
  createOrder(@Body('registrationId') registrationId: string) {
    return this.paymentsService.createOrderForRegistration(registrationId);
  }

  // ✅ VERIFY PAYMENT - Use paymentsIntegrationService
  @Post('verify')
  verify(@Body() body: any) {
    return this.paymentsIntegrationService.verifyPaymentForRegistration(body);
  }

  // ✅ PAYMENT FAILED - Use paymentsIntegrationService
  @Post('fail/:registrationId')
  markFailed(@Param('registrationId') registrationId: string) {
    return this.paymentsIntegrationService.markPaymentFailed(registrationId);
  }

  // ✅ WEBHOOK - Use paymentsIntegrationService
  @Post('webhook')
  webhook(
    @Req() req: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing Razorpay signature');
    }

    return this.paymentsIntegrationService.handleWebhook(req.body, signature);
  }

  // ✅ GET PAYMENT DETAILS - Use paymentsService
  @Get('details/:registrationId')
  async getPaymentDetails(@Param('registrationId') registrationId: string) {
    return this.paymentsService.getPaymentDetails(registrationId);
  }
}
