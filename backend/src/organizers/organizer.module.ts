import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Organizer, OrganizerSchema } from './schemas/organizer.schema';
import { OrganizersService } from './organizer.service';
import { OrganizersController } from './organizers.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Organizer.name, schema: OrganizerSchema },
    ]),
  ],
    controllers: [OrganizersController], // ✅ VERY IMPORTANT

  providers: [OrganizersService],
  exports: [OrganizersService],
})
export class OrganizersModule {}
