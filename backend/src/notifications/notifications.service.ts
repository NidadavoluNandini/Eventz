import { Injectable } from '@nestjs/common';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  async sendOrderConfirmation(data: {
    email?: string;
    phone: string;
    orderId: string;
    eventTitle: string;
    amount: number;
  }) {
    const message = `
Your booking is confirmed 🎉
Event: ${data.eventTitle}
Order ID: ${data.orderId}
Amount Paid: ₹${data.amount}
`;

    // SMS (mandatory)
    await this.smsService.sendSms(
      data.phone,
      message,
    );

    // Email (optional)
    if (data.email) {
      await this.emailService.sendEmail(
        data.email,
        'Event Booking Confirmed',
        message,
      );
    }
  }

  async sendPaymentFailed(phone: string, orderId: string) {
    await this.smsService.sendSms(
      phone,
      `❌ Payment failed for Order ${orderId}. Please retry.`,
    );
  }
}
