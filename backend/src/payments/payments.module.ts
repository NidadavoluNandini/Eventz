// payments.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsService } from './payments.service';
import { PaymentsIntegrationService } from './payments-integration.service';
import { PaymentsController } from './payments.controller';
import { RazorpayService } from './razorpay.service';

// ✅ Import schemas
import { Registration, RegistrationSchema } from '../registrations/schemas/registration.schema';
import { Event, EventSchema } from '../events/schemas/event.schema'; // ✅ Add this

// Import other services
import { EmailService } from '../notifications/email.service';
import { RegistrationsModule } from '../registrations/registrations.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Registration.name, schema: RegistrationSchema },
      { name: Event.name, schema: EventSchema }, // ✅ Add Event model
    ]),
    RegistrationsModule, // ✅ Import RegistrationsModule for RegistrationsService
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentsIntegrationService, // ✅ Both services
    RazorpayService,
    EmailService,
  ],
  exports: [PaymentsService, PaymentsIntegrationService],
})
export class PaymentsModule {}
