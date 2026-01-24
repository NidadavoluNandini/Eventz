import {
  Controller,
  Get,
  Put,
  Delete,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';

import { OrganizersService } from './organizer.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateOrganizerDto } from './dto/update-organizer.dto';

@Controller('organizers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ORGANIZER')
export class OrganizersController {
  constructor(
    private readonly organizersService: OrganizersService,
  ) {}

  // ✅ GET MY PROFILE
  @Get('me')
  getProfile(@Req() req) {
    return this.organizersService.findById(
      req.user.userId,
    );
  }
@Put('me')
updateProfile(
  @Req() req,
  @Body() dto: UpdateOrganizerDto,
) {
  return this.organizersService.update(
    req.user.userId,
    dto,
  );
}
  // ✅ UPDATE PROFILE
@Put('change-password')
changePassword(
  @Req() req,
  @Body() dto: ChangePasswordDto,
) {
  return this.organizersService.changePassword(
    req.user.userId,
    dto,
  );
}

  // ✅ DELETE ACCOUNT
  @Delete('me')
  deleteAccount(@Req() req) {
    return this.organizersService.delete(
      req.user.userId,
    );
  }

  // ✅ LOGOUT
  @Post('logout')
  logout() {
    return {
      message:
        'Logout successful (client must delete token)',
    };
  }
}


