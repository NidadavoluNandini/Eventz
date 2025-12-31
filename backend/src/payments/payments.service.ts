import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../orders/schemas/order.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { RazorpayService } from './razorpay.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
    private readonly notificationsService: NotificationsService,
    private readonly razorpayService: RazorpayService,
  ) {}

  async createRazorpayOrder(orderId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new BadRequestException('Order not found');

    const razorpayOrder =
      await this.razorpayService.createOrder(
        order.amount,
        orderId,
      );

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return razorpayOrder;
  }
}