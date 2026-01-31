import {
  Controller,
  Get,
  Put,
  Delete,
  Post,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { OrganizersService } from './organizer.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('organizers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ORGANIZER')
export class OrganizersController {
  constructor(private readonly organizersService: OrganizersService) {}

  // =======================
  // GET MY PROFILE
  // =======================
  @Get('me')
  getProfile(@Req() req) {
    return this.organizersService.findById(req.user.userId);
  }

  // =======================
  // UPDATE PROFILE (WITH IMAGE)
  // =======================
@Put('me')
updateProfile(
  @Req() req,
  @Body() body,
) {
  return this.organizersService.update(req.user.userId, {
    name: body.name,
    email: body.email,
    photo: body.photo, // JUST URL
  });
}

  // =======================
  // CHANGE PASSWORD
  // =======================
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

  // =======================
  // DELETE MY ACCOUNT ✅ (CORRECT)
  // =======================
  @Delete('me')
  deleteAccount(@Req() req) {
    return this.organizersService.delete(req.user.userId);
  }

  // =======================
  // LOGOUT
  // =======================
  @Post('logout')
  logout() {
    return {
      message: 'Logout successful (client deletes token)',
    };
  }
}
