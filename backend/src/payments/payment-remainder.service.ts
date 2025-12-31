import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Registration, RegistrationStatus } from '../registrations/schemas/registration.schema';
import { EmailService } from '../notifications/email.service';

@Injectable()
export class PaymentReminderService {
  constructor(
    @InjectModel(Registration.name)
    private registrationModel: Model<Registration>,
    private emailService: EmailService,
  ) {}

  // ⏰ Every 3 hours
  @Cron('0 */2 * * *')
  async sendPaymentReminders() {
    const threeHoursAgo = new Date(
      Date.now() - 2 * 60 * 60 * 1000,
    );

    const pendingRegs = await this.registrationModel.find({
      status: RegistrationStatus.PENDING_PAYMENT,
      $or: [
        { lastPaymentReminderAt: { $lt: threeHoursAgo } },
        { lastPaymentReminderAt: { $exists: false } },
      ],
      paymentReminderCount: { $lt: 5 }, // 🔒 max 5 emails
    }).populate('eventId');

    for (const reg of pendingRegs) {
      await this.emailService.sendEmail(
        reg.userEmail,
        'Complete your Event Registration',
        `
Hi ${reg.userName},

Your registration for "${(reg.eventId as any).title}" is still pending.

👉 Resume payment here:
${process.env.FRONTEND_URL}/payment/${reg._id}

This link is valid until the event starts.

– Eventz Team
        `,
      );

      await this.registrationModel.findByIdAndUpdate(
        reg._id,
        {
          lastPaymentReminderAt: new Date(),
          $inc: { paymentReminderCount: 1 },
        },
      );
    }
  }
}
