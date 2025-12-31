import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { PaymentsIntegrationService } from './payments-integration.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsIntegrationService: PaymentsIntegrationService,
  ) {}

  @Post('registration/create-order')
  createRegistrationOrder(
    @Body('registrationId') registrationId: string,
  ) {
    return this.paymentsIntegrationService.createOrderForRegistration(
      registrationId,
    );
  }

  @Post('registration/verify')
  verifyRegistrationPayment(@Body() body: any) {
    return this.paymentsIntegrationService.verifyPaymentForRegistration(
      body,
    );
  }

  @Post('registration/retry')
  retryPayment(@Body('registrationId') registrationId: string) {
    return this.paymentsIntegrationService.createOrderForRegistration(
      registrationId,
    );
  }

  @Post('registration/failed')
  markFailed(@Body('registrationId') registrationId: string) {
    return this.paymentsIntegrationService.markPaymentFailed(
      registrationId,
    );
  }

  @Post('webhook')
  webhook(
    @Body() body: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing signature');
    }
    return this.paymentsIntegrationService.handleWebhook(
      body,
      signature,
    );
  }
}
