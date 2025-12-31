import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
  Put,
  Delete,
} from '@nestjs/common';
import { OrdersService } from './orders.services';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
  ) {}

  // PUBLIC – Create booking
  @Post()
  createOrder(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }

  // PUBLIC – Get order details
  @Get(':id')
  getOrder(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  // 🔐 ORGANIZER – Get ALL orders (for dashboard)
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  getAllOrders() {
    return this.ordersService.findAll();
  }
  @Put(':id/status')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ORGANIZER')
updateOrderStatus(
  @Param('id') id: string,
  @Body('status') status: 'PENDING' | 'PAID' | 'CANCELLED',
) {
  return this.ordersService.updateStatus(id, status);
}
@Delete(':id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ORGANIZER')
deleteOrder(@Param('id') id: string) {
  return this.ordersService.delete(id);
}

}
