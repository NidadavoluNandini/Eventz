import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { OrganizersModule } from '../organizers/organizer.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    OrganizersModule,
    
    NotificationsModule,

    PassportModule.register({ defaultStrategy: 'jwt' }), // 🔥 REQUIRED

    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy, // 🔥 REQUIRED
  ],
  exports: [
    PassportModule,
    JwtModule,
  ],
})
export class AuthModule {}
