import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Registration,
  RegistrationStatus,
} from '../registrations/schemas/registration.schema';
import { EmailService } from '../notifications/email.service';

@Injectable()
export class PaymentReminderService {
  constructor(
    @InjectModel(Registration.name)
    private readonly registrationModel: Model<Registration>,
    private readonly emailService: EmailService,
  ) {}

  // ⏰ Runs every 2 hours
  @Cron('0 */2 * * *')
  async sendRegistrationReminders() {
    console.log('⏰ Registration reminder cron running');

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const pendingRegs = await this.registrationModel
      .find({
        status: {
          $in: [
            RegistrationStatus.PENDING_OTP,
            RegistrationStatus.PENDING_PAYMENT,
          ],
        },
        $and: [
          {
            $or: [
              { lastReminderSentAt: { $lt: twoHoursAgo } },
              { lastReminderSentAt: { $exists: false } },
            ],
          },
          {
            $or: [
              { reminderCount: { $lt: 5 } },
              { reminderCount: { $exists: false } },
            ],
          },
        ],
      })
      .populate('eventId');

    console.log(`📨 Found ${pendingRegs.length} pending registrations`);

    for (const reg of pendingRegs) {
      let reason = '';
      let resumeUrl = '';

      // 🔴 OTP NOT VERIFIED
      if (reg.status === RegistrationStatus.PENDING_OTP) {
        reason = 'OTP was not verified';
        resumeUrl = `${process.env.FRONTEND_URL}/verify-otp/${reg._id}`;
      }

      // 🔴 PAYMENT NOT COMPLETED
      if (reg.status === RegistrationStatus.PENDING_PAYMENT) {
        reason = 'Payment was not completed';
        resumeUrl = `${process.env.FRONTEND_URL}/payment/${reg._id}`;
      }

      await this.emailService.sendEmail(
        reg.userEmail,
        '⏳ Complete your Event Registration',
        `
Hi ${reg.userName},

You started registering for the event
"${(reg.eventId as any).title}"
but didn’t complete the process.

❌ Where you stopped:
${reason}

👉 Resume your registration here:
${resumeUrl}

⚠️ Your registration will expire automatically.

– Team Eventz
        `,
      );

      await this.registrationModel.findByIdAndUpdate(reg._id, {
        lastReminderSentAt: new Date(),
        $inc: { reminderCount: 1 },
      });
    }
  }
}
