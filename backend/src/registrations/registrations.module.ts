import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RegistrationsService } from './registrations.service';
import { RegistrationsController } from './registrations.controller';

import {
  Registration,
  RegistrationSchema,
} from './schemas/registration.schema';
import { Event, EventSchema } from '../events/schemas/event.schema';

import { EmailService } from '../notifications/email.service';
import { SmsService } from '../notifications/sms.service';

import { InvoiceService } from '../payments/invoice.service';
import {
  Invoice,
  InvoiceSchema,
} from '../payments/schemas/invoice.schema';
import {
  InvoiceCounter,
  InvoiceCounterSchema,
} from '../payments/schemas/invoice-counter.schema';

import { TicketsModule } from '../tickets/tickets.module';
import { RegistrationExpiryService } from './registration-expiry.service';

@Module({
  imports: [
    // 🔥 REGISTER ALL MODELS USED BY SERVICES IN THIS MODULE
    MongooseModule.forFeature([
      { name: Registration.name, schema: RegistrationSchema },
      { name: Event.name, schema: EventSchema },

      // ✅ THIS IS WHAT WAS MISSING
      { name: Invoice.name, schema: InvoiceSchema },
      { name: InvoiceCounter.name, schema: InvoiceCounterSchema },
    ]),
    forwardRef(() => TicketsModule),
  ],
  controllers: [RegistrationsController],
  providers: [
    RegistrationsService,
    EmailService,
    SmsService,
    InvoiceService,
  ],
  exports: [
    RegistrationsService,
    RegistrationExpiryService, 

  ],
})
export class RegistrationsModule {}
