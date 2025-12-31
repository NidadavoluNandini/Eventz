import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from './schemas/order.schema';
import { Event } from '../events/schemas/event.schema';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,

    @InjectModel(Event.name)
    private readonly eventModel: Model<Event>,
  ) {}

async createOrder(dto: CreateOrderDto) {
  if (!Types.ObjectId.isValid(dto.eventId)) {
    throw new BadRequestException('Invalid eventId');
  }

  const event = await this.eventModel.findById(dto.eventId);
  if (!event) {
    throw new NotFoundException('Event not found');
  }

  return this.orderModel.create({
    eventId: new Types.ObjectId(dto.eventId),
    userPhone: dto.userPhone,
    amount: dto.amount,
    status: 'PENDING',
  });
}

  async findById(orderId: string) {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestException('Invalid orderId');
    }

    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
  async findAll() {
  return this.orderModel
    .find()
    .populate('eventId')
    .sort({ createdAt: -1 });
}
async updateStatus(id: string, status: string) {
  return this.orderModel.findByIdAndUpdate(
    id,
    { status },
    { new: true },
  );
}
delete(id: string) {
  return this.orderModel.findByIdAndDelete(id);
}

}
