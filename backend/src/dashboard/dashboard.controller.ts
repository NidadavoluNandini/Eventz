import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ORGANIZER')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // Get organizer's overall analytics
  @Get('analytics')
  getOrganizerAnalytics(@Req() req) {
    return this.dashboardService.getOrganizerAnalytics(req.user.userId);
  }

  // Get specific event analytics
  @Get('events/:eventId/analytics')
  getEventAnalytics(@Param('eventId') eventId: string) {
    return this.dashboardService.getEventAnalytics(eventId);
  }

  // Get registered users for an event
  @Get('events/:eventId/users')
  getEventUsers(
    @Param('eventId') eventId: string,
    @Query('ticketType') ticketType?: string,
    @Query('paymentStatus') paymentStatus?: string,
  ) {
    return this.dashboardService.getEventUsers(eventId, {
      ticketType,
      paymentStatus,
    });
  }
}
