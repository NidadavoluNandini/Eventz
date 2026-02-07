import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Organizer, OrganizerSchema } from './schemas/organizer.schema';
import { OrganizersService } from './organizer.service';
import { OrganizersController } from './organizers.controller';
import { UploadModule } from 'src/upload/upload.module'; // ⬅ add this

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Organizer.name, schema: OrganizerSchema },
    ]),
    UploadModule, 
  ],
    controllers: [OrganizersController], // ✅ VERY IMPORTANT

  providers: [OrganizersService],
  exports: [OrganizersService],
})
export class OrganizersModule {}
