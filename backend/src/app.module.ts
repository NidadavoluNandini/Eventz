import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactsModule } from './contact/contacts.module';

import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { TicketsModule } from './tickets/tickets.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { OrganizersModule } from './organizers/organizer.module';
import { MailModule } from './email/mail.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI || ''),
    ScheduleModule.forRoot(),
    AuthModule,
    ContactsModule,
    EventsModule,
    OrdersModule,
    PaymentsModule,
    TicketsModule,
    NotificationsModule,
    RegistrationsModule,
    DashboardModule,
    OrganizersModule,
    MailModule,
  ],
})
export class AppModule {}
