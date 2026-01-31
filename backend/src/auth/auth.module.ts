import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { OrganizersModule } from '../organizers/organizer.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Organizer, OrganizerSchema } from '../organizers/schemas/organizer.schema';
import { Otp, OtpSchema } from './dto/otp.schema';

@Module({
  imports: [
    OrganizersModule,
    NotificationsModule,

    MongooseModule.forFeature([
      { name: Organizer.name, schema: OrganizerSchema },
      { name: Otp.name, schema: OtpSchema },
    ]),

    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [
    AuthController, // 🔥 THIS WAS MISSING
  ],
  providers: [
    AuthService,    // 🔥 THIS WAS MISSING
    JwtStrategy,    // 🔥 THIS WAS MISSING
  ],
  exports: [
    PassportModule,
    JwtModule,
  ],
})

export class AuthModule {}
