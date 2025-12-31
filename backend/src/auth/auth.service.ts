import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { OrganizersService } from '../organizers/organizer.service';
import { EmailService } from '../notifications/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly organizersService: OrganizersService,
    private readonly emailService: EmailService,
  ) {}



  
  // =======================
  // ORGANIZER – REGISTER
  // =======================

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

  // =======================
  // ORGANIZER – LOGIN
  // =======================

  async loginOrganizer(dto: {
    email: string;
    password: string;
  }) {
    const organizer = await this.organizersService.findByEmail(
      dto.email,
    );

    if (!organizer) {
      throw new UnauthorizedException('Organizer not found');
    }

    const isMatch = await bcrypt.compare(
      dto.password,
      organizer.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Invalid password');
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

  // =======================
  // ORGANIZER – FORGOT PASSWORD
  // =======================
async organizerForgotPassword(email: string) {
  const organizer = await this.organizersService.findByEmail(email);

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

  // Always return same message (security)
  return {
    message:
      'If this email exists, a password reset notification has been sent.',
  };
}

async changeOrganizerPassword(
  organizerId: string,
  currentPassword: string,
  newPassword: string,
) {
  const organizer =
    await this.organizersService.findById(organizerId);

  if (!organizer) {
    throw new NotFoundException('Organizer not found');
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

  organizer.password = await bcrypt.hash(newPassword, 10);
  await organizer.save();

  // optional security email
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

  return { message: 'Password updated successfully' };
}

  // =======================
  // ORGANIZER – RESET PASSWORD
  // =======================

async organizerResetPasswordDirect(
  email: string,
  newPassword: string,
) {
  const organizer = await this.organizersService.findByEmail(email);

  if (!organizer) {
    throw new NotFoundException('Organizer not found');
  }

  organizer.password = await bcrypt.hash(newPassword, 10);
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

  return { message: 'Password updated successfully' };
}
  // =======================
  // ORGANIZER – DELETE ACCOUNT
  // =======================

  async deleteOrganizerAccount(organizerId: string) {
    const organizer =
      await this.organizersService.findById(organizerId);

    if (!organizer) {
      throw new NotFoundException('Organizer not found');
    }

    await organizer.deleteOne();

    return {
      message: 'Organizer account deleted successfully',
    };
  }
}
