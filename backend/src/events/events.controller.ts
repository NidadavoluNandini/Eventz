import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { EventStatus } from './schemas/event.schema';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // ✅ PUBLIC – list all published events (with filters)
  @Get()
  getAllEvents(
    @Query('status') status?: EventStatus,
    @Query('category') category?: string,
    @Query('city') city?: string,
  ) {
    return this.eventsService.findAll({ status, category, city });
  }

  // ✅ PUBLIC – get event by ID
  @Get(':id')
  getEvent(@Param('id') id: string) {
    return this.eventsService.findById(id);
  }

  // 🔐 ORGANIZER – create event
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  createEvent(@Body() dto: CreateEventDto, @Req() req) {
    return this.eventsService.create(dto, req.user.userId);
  }

  // 🔐 ORGANIZER – update event
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  updateEvent(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, dto);
  }

  // 🔐 ORGANIZER – delete event
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  deleteEvent(@Param('id') id: string) {
    return this.eventsService.delete(id);
  }

  // 🔐 ORGANIZER – get my events
  @Get('organizer/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  myEvents(@Req() req) {
    return this.eventsService.findByOrganizer(req.user.userId);
  }

  // 🔐 ORGANIZER – publish event
  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  publishEvent(@Param('id') id: string) {
    return this.eventsService.publishEvent(id);
  }

  // 🔐 ORGANIZER – unpublish event
  @Patch(':id/unpublish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  unpublishEvent(@Param('id') id: string) {
    return this.eventsService.unpublishEvent(id);
  }

  // 🔐 ORGANIZER – mark event as completed
  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  completeEvent(@Param('id') id: string) {
    return this.eventsService.markCompleted(id);
  }
}

