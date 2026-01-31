import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { Organizer } from '../organizers/schemas/organizer.schema';
import { OrganizersService } from '../organizers/organizer.service';
import { EmailService } from '../notifications/email.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp } from './dto/otp.schema';

@Injectable()
export class AuthService {
  constructor(
  private readonly jwtService: JwtService,
  private readonly emailService: EmailService,
  private readonly organizersService: OrganizersService,

  @InjectModel(Organizer.name)
  private readonly organizerModel: Model<Organizer>,

  @InjectModel(Otp.name)
  private readonly otpModel: Model<Otp>,
) {}



  // ============================
  // ORGANIZER REGISTER
  // ============================
  async registerOrganizer(dto: {
    name: string;
    email: string;
    password: string;
  }) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const organizer = await this.organizersService.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      role: 'ORGANIZER',
    });

    const token = this.jwtService.sign({
      sub: organizer._id.toString(),
      role: organizer.role,
    });

    return {
      accessToken: token,
      organizer: {
        _id: organizer._id,
        name: organizer.name,
        email: organizer.email,
        role: organizer.role,
      },
    };
  }
async sendOrganizerOtp(email: string) {
  const existing = await this.organizerModel.findOne({ email });
  if (existing) {
    throw new BadRequestException('Email already registered');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await this.otpModel.findOneAndUpdate(
    { email },
    {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 mins
    },
    { upsert: true }
  );

await this.emailService.sendOtpEmail(email, otp);

  return { message: 'OTP sent successfully' };
}
async verifyOrganizerOtp(email: string, otp: string) {
  const record = await this.otpModel.findOne({ email });

  if (!record || record.otp !== otp) {
    throw new BadRequestException('Invalid OTP');
  }

  if (record.expiresAt < Date.now()) {
    throw new BadRequestException('OTP expired');
  }

  await this.otpModel.deleteOne({ email });

  return {
    verified: true,
    message: 'Email verified successfully',
  };
}

  // ============================
  // ORGANIZER LOGIN
  // ============================
  async loginOrganizer(dto: {
    email: string;
    password: string;
  }) {
    const organizer =
      await this.organizersService.findByEmail(
        dto.email,
      );

    if (!organizer) {
      throw new UnauthorizedException(
        'Organizer not found',
      );
    }

    const isMatch = await bcrypt.compare(
      dto.password,
      organizer.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException(
        'Invalid password',
      );
    }

    const token = this.jwtService.sign({
      sub: organizer._id.toString(),
      role: organizer.role,
    });

    return {
      accessToken: token,
      organizer: {
        _id: organizer._id,
        name: organizer.name,
        email: organizer.email,
        role: organizer.role,
      },
    };
  }

  // ============================
  // ORGANIZER FORGOT PASSWORD
  // ============================
  async organizerForgotPassword(email: string) {
    const organizer =
      await this.organizersService.findByEmail(
        email,
      );

    if (organizer) {
      await this.emailService.sendEmail(
        organizer.email,
        'Password Reset Request – Eventz',
        `
Hi ${organizer.name},

We received a request to reset your Eventz organizer account password.

Please open the Eventz app and update your password from the reset screen.

If you did not request this, you can safely ignore this email.

— Team Eventz
`,
      );
    }

    // always return same response
    return {
      message:
        'If this email exists, a password reset notification has been sent.',
    };
  }

  // ============================
  // CHANGE PASSWORD (LOGGED IN)
  // ============================
  async changeOrganizerPassword(
    organizerId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const organizer =
      await this.organizersService.findById(
        organizerId,
      );

    if (!organizer) {
      throw new NotFoundException(
        'Organizer not found',
      );
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      organizer.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException(
        'Current password is incorrect',
      );
    }

    organizer.password = await bcrypt.hash(
      newPassword,
      10,
    );

    await organizer.save();

    await this.emailService.sendEmail(
      organizer.email,
      'Password Changed – Eventz',
      `
Hi ${organizer.name},

Your Eventz organizer account password was changed successfully.

If this was not you, please contact support immediately.

— Team Eventz
`,
    );

    return {
      message: 'Password updated successfully',
    };
  }

  // ============================
  // RESET PASSWORD (WITHOUT TOKEN)
  // ============================
  async organizerResetPasswordDirect(
    email: string,
    newPassword: string,
  ) {
    const organizer =
      await this.organizersService.findByEmail(
        email,
      );

    if (!organizer) {
      throw new NotFoundException(
        'Organizer not found',
      );
    }

    organizer.password = await bcrypt.hash(
      newPassword,
      10,
    );
    await organizer.save();

    await this.emailService.sendEmail(
      organizer.email,
      'Password Updated – Eventz',
      `
Hi ${organizer.name},

Your Eventz organizer account password has been updated successfully.

If this was not you, please contact support immediately.

— Team Eventz
`,
    );

    return {
      message: 'Password updated successfully',
    };
  }

  // ============================
  // DELETE ACCOUNT
  // ============================
  async deleteOrganizerAccount(
    organizerId: string,
  ) {
    const organizer =
      await this.organizersService.findById(
        organizerId,
      );

    if (!organizer) {
      throw new NotFoundException(
        'Organizer not found',
      );
    }

    await organizer.deleteOne();

    return {
      message:
        'Organizer account deleted successfully',
    };
  }
}
