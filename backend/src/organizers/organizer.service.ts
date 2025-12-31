import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organizer } from './schemas/organizer.schema';

@Injectable()
export class OrganizersService {
  constructor(
    @InjectModel(Organizer.name)
    private organizerModel: Model<Organizer>,
  ) {}

  // ✅ CREATE
  async create(data: Partial<Organizer>) {
    return this.organizerModel.create(data);
  }

  // ✅ FIND BY EMAIL (used in Auth)
  async findByEmail(email: string) {
    return this.organizerModel.findOne({ email }).exec();
  }

  // ✅ FIND BY ID (used in controller)
  async findById(id: string) {
    const organizer = await this.organizerModel.findById(id).exec();
    if (!organizer) {
      throw new NotFoundException('Organizer not found');
    }
    return organizer;
  }

  // ✅ UPDATE PROFILE
  async update(id: string, data: Partial<Organizer>) {
    const organizer = await this.organizerModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();

    if (!organizer) {
      throw new NotFoundException('Organizer not found');
    }

    return organizer;
  }

  // ✅ DELETE ACCOUNT
  async delete(id: string) {
    const organizer = await this.organizerModel.findByIdAndDelete(id).exec();

    if (!organizer) {
      throw new NotFoundException('Organizer not found');
    }

    return { message: 'Organizer deleted successfully' };
  }
}
