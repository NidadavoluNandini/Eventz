import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Organizer, OrganizerSchema } from './schemas/organizer.schema';
import { OrganizersService } from './organizer.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Organizer.name, schema: OrganizerSchema },
    ]),
  ],
  providers: [OrganizersService],
  exports: [OrganizersService],
})
export class OrganizersModule {}
