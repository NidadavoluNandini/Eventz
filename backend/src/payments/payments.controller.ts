import {
  Controller,
  Post,
  Body,
  Param,
  Headers,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { PaymentsIntegrationService } from './payments-integration.service';

@Controller('payments/registration')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsIntegrationService,
  ) {}

  // ✅ CREATE ORDER
  @Post('create-order')
  createOrder(
    @Body('registrationId') registrationId: string,
  ) {
    return this.paymentsService.createOrderForRegistration(
      registrationId,
    );
  }

  // ✅ VERIFY PAYMENT
  @Post('verify')
  verify(@Body() body: any) {
    return this.paymentsService.verifyPaymentForRegistration(
      body,
    );
  }

  // ✅ PAYMENT FAILED
  @Post('fail/:registrationId')
  markFailed(
    @Param('registrationId') registrationId: string,
  ) {
    return this.paymentsService.markPaymentFailed(
      registrationId,
    );
  }

  // ✅ WEBHOOK
  @Post('webhook')
  webhook(
    @Req() req: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException(
        'Missing Razorpay signature',
      );
    }

    return this.paymentsService.handleWebhook(
      req.body,
      signature,
    );
  }
}
