import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';

@Module({
  providers: [
    NotificationsService,
    EmailService,
    SmsService,
  ],
  exports: [
    NotificationsService,
    EmailService,
    SmsService,
  ],
})
export class NotificationsModule {}
