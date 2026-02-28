import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

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
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    /**
     * ✅ Load ENV first
     */
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.development', // ← IMPORTANT
    }),

    /**
     * ✅ MongoDB connection (CORRECT WAY)
     */
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),

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
    UploadModule,
  ],
})
export class AppModule {}