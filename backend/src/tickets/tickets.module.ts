import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

import {
  Registration,
  RegistrationSchema,
} from '../registrations/schemas/registration.schema';

import { Event, EventSchema } from '../events/schemas/event.schema';

import { QrService } from './qr.service';
import { PdfService } from './pdf.service';
import { EmailService } from '../notifications/email.service';
import { RegistrationsModule } from '../registrations/registrations.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Registration.name,
        schema: RegistrationSchema,
      },
      {
        name: Event.name,
        schema: EventSchema,
      },
    ]),
    forwardRef(() => RegistrationsModule),
  ],
  controllers: [TicketsController],
  providers: [
    TicketsService,
    QrService,
    PdfService,
    EmailService,
  ],
  exports: [TicketsService],
})
export class TicketsModule {}
