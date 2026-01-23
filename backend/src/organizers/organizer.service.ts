import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { Organizer } from './schemas/organizer.schema';
import { UpdateOrganizerDto } from './dto/update-organizer.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class OrganizersService {
  constructor(
    @InjectModel(Organizer.name)
    private organizerModel: Model<Organizer>,
  ) {}

  // ✅ GET PROFILE
  async findById(id: string) {
    const organizer = await this.organizerModel
      .findById(id)
      .select('-password');

    if (!organizer) {
      throw new NotFoundException(
        'Organizer not found',
      );
    }

    return organizer;
  }

  // ✅ UPDATE PROFILE
  async update(
    id: string,
    dto: UpdateOrganizerDto,
  ) {
    if (dto.email) {
      const exists =
        await this.organizerModel.findOne({
          email: dto.email,
          _id: { $ne: id },
        });

      if (exists) {
        throw new ConflictException(
          'Email already in use',
        );
      }
    }

    const updated =
      await this.organizerModel
        .findByIdAndUpdate(id, dto, {
          new: true,
        })
        .select('-password');

    if (!updated) {
      throw new NotFoundException(
        'Organizer not found',
      );
    }

    return updated;
  }

  // ✅ CHANGE PASSWORD
  async changePassword(
    id: string,
    dto: ChangePasswordDto,
  ) {
    const organizer =
      await this.organizerModel.findById(id);

    if (!organizer) {
      throw new NotFoundException(
        'Organizer not found',
      );
    }

    const match = await bcrypt.compare(
      dto.oldPassword,
      organizer.password,
    );

    if (!match) {
      throw new BadRequestException(
        'Old password incorrect',
      );
    }

    organizer.password = await bcrypt.hash(
      dto.newPassword,
      10,
    );

    await organizer.save();

    return {
      message: 'Password updated successfully',
    };
  }

  // ✅ DELETE ACCOUNT
  async delete(id: string) {
    await this.organizerModel.findByIdAndDelete(id);

    return {
      message: 'Organizer account deleted',
    };
  }
}
