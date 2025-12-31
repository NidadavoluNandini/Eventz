import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PaymentsController } from './payments.controller';
import { PaymentsIntegrationService } from './payments-integration.service';
import { RazorpayService } from './razorpay.service';

import { Registration, RegistrationSchema } from '../registrations/schemas/registration.schema';
import { RegistrationsModule } from '../registrations/registrations.module';
import { TicketsModule } from '../tickets/tickets.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Registration.name, schema: RegistrationSchema },
    ]),
    NotificationsModule, // ✅ REQUIRED FOR EMAIL
    TicketsModule,
    forwardRef(() => RegistrationsModule),
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsIntegrationService,
    RazorpayService,
  ],
})
export class PaymentsModule {}
