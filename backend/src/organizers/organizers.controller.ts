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
import { UploadService } from 'src/upload/upload.service';

@Controller('organizers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ORGANIZER')
export class OrganizersController {
  constructor(
    private readonly organizersService: OrganizersService,
    private readonly uploadService: UploadService,
  ) {}

  // =======================
  // GET MY PROFILE
  // =======================
  @Get('me')
  getProfile(@Req() req) {
    return this.organizersService.findById(req.user.userId);
  }

  // =======================
  // UPDATE PROFILE (JUST DATA / URL)
  // =======================
  @Put('me')
  updateProfile(@Req() req, @Body() body: any) {
    return this.organizersService.update(req.user.userId, {
      name: body.name,
      email: body.email,
      photo: body.photo, // URL from client
    });
  }

  // =======================
  // UPLOAD PROFILE PHOTO (S3)
  // =======================
  @Post('me/photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePhoto(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { url } = await this.uploadService.uploadImage(file);
    // save URL to organizer document
    return this.organizersService.update(req.user.userId, {
      photo: url,
    });
  }

  // =======================
  // CHANGE PASSWORD
  // =======================
  @Put('change-password')
  changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    return this.organizersService.changePassword(req.user.userId, dto);
  }

  // =======================
  // DELETE MY ACCOUNT
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
