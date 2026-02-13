// events/events.controller.ts
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
  UsePipes,
  ValidationPipe,
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

  // ✅ CREATE EVENT (Starts as DRAFT)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: false }))
  createEvent(@Body() body: CreateEventDto, @Req() req) {
    return this.eventsService.create(body, req.user.userId);
  }

  // ✅ GET ALL PUBLIC EVENTS (Only PUBLISHED with registrationOpen=true)
  @Get()
  getAllEvents(
    @Query('status') status?: EventStatus,
    @Query('category') category?: string,
    @Query('city') city?: string,
  ) {
    return this.eventsService.findAll({ status, category, city });
  }

  // ✅ GET ORGANIZER'S EVENTS (All statuses)
  @Get('organizer/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  myEvents(@Req() req) {
    return this.eventsService.findByOrganizer(req.user.userId);
  }

  // ✅ GET EVENT BY ID
  @Get(':id')
  getEvent(@Param('id') id: string) {
    return this.eventsService.findById(id);
  }

  // ✅ UPDATE EVENT
 @Put(':id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ORGANIZER')
@UsePipes(new ValidationPipe({ whitelist: true, transform: false }))
updateEvent(@Param('id') id: string, @Body() dto: UpdateEventDto, @Req() req) {
  return this.eventsService.update(id, dto);
}


  // ✅ DELETE EVENT
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  deleteEvent(@Param('id') id: string) {
    return this.eventsService.delete(id);
  }

  // ✅ PUBLISH EVENT (Make visible + open registration)
  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  publishEvent(@Param('id') id: string) {
    return this.eventsService.publishEvent(id);
  }

  // ✅ UNPUBLISH EVENT (Hide + close registration)
  @Patch(':id/unpublish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  unpublishEvent(@Param('id') id: string) {
    return this.eventsService.unpublishEvent(id);
  }

  // ✅ MOVE TO DRAFT (For editing)
  @Patch(':id/draft')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  moveToDraft(@Param('id') id: string) {
    return this.eventsService.moveToDraft(id);
  }

  // ✅ CLOSE REGISTRATION (Keep visible but stop registrations)
  @Patch(':id/close-registration')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  closeRegistration(@Param('id') id: string, @Req() req) {
    return this.eventsService.closeRegistration(id, req.user.userId);
  }

  // ✅ OPEN REGISTRATION
  @Patch(':id/open-registration')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  openRegistration(@Param('id') id: string, @Req() req) {
    return this.eventsService.openRegistration(id, req.user.userId);
  }

  // ✅ MARK AS COMPLETED
  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  completeEvent(@Param('id') id: string) {
    return this.eventsService.markCompleted(id);
  }
}
