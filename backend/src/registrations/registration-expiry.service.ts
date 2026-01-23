import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Registration,
  RegistrationStatus,
} from '../registrations/schemas/registration.schema';

@Injectable()
export class RegistrationExpiryService {
  constructor(
    @InjectModel(Registration.name)
    private readonly registrationModel: Model<Registration>,
  ) {}

  // runs every hour
  @Cron('0 * * * *')
  async cancelExpiredRegistrations() {
    const now = new Date();

    const expired = await this.registrationModel.updateMany(
      {
        status: {
          $in: [
            RegistrationStatus.PENDING_OTP,
            RegistrationStatus.PENDING_PAYMENT,
          ],
        },
        expiresAt: { $lte: now },
      },
      {
        $set: {
          status: RegistrationStatus.CANCELLED,
        },
      },
    );

    if (expired.modifiedCount > 0) {
      console.log(
        `⛔ Auto-cancelled ${expired.modifiedCount} expired registrations`,
      );
    }
  }
}
