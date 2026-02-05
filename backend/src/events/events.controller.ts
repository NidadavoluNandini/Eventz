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
  UsePipes,        // ✅ ADD
  ValidationPipe,  // ✅ ADD
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
  constructor(private readonly eventsService: EventsService) {
        console.log('🔥 EventsController LOADED');

  }
@Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ORGANIZER')
@UsePipes(new ValidationPipe({ whitelist: true, transform: false }))
createEvent(@Body() body: CreateEventDto, @Req() req) {
  console.log('RAW BODY:', JSON.stringify(body, null, 2));
  return this.eventsService.create(body, req.user.userId);
}
@Post('ping')
ping(@Body() body: any) {
  console.log('🔥 PING HIT', body);
  return { ok: true };
}

  // 🌍 Public
  @Get()
  getAllEvents(
    @Query('status') status?: EventStatus,
    @Query('category') category?: string,
    @Query('city') city?: string,
  ) {
    return this.eventsService.findAll({ status, category, city });
  }

  // 👤 Organizer (STATIC ROUTE FIRST ✅)
  @Get('organizer/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  myEvents(@Req() req) {
    return this.eventsService.findByOrganizer(req.user.userId);
  }

  // 🔍 Event by ID (DYNAMIC ROUTE LAST ✅)
  @Get(':id')
  getEvent(@Param('id') id: string) {
    return this.eventsService.findById(id);
  }

  // 👤 Organizer Actions


  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  updateEvent(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  deleteEvent(@Param('id') id: string) {
    return this.eventsService.delete(id);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  publishEvent(@Param('id') id: string) {
    return this.eventsService.publishEvent(id);
  }

  @Patch(':id/unpublish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  unpublishEvent(@Param('id') id: string) {
    return this.eventsService.unpublishEvent(id);
  }

  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  completeEvent(@Param('id') id: string) {
    return this.eventsService.markCompleted(id);
  }

  @Patch(':id/close-registration')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  closeRegistration(@Param('id') id: string, @Req() req) {
    return this.eventsService.closeRegistration(id, req.user.userId);
  }

  @Patch(':id/draft')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  moveToDraft(@Param('id') id: string) {
    return this.eventsService.moveToDraft(id);
  }
}
