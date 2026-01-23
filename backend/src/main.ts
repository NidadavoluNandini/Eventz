import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // API prefix
  app.setGlobalPrefix('api');

  /**
   * ✅ CORS CONFIGURATION
   * Works with:
   * - localhost
   * - Vercel frontend
   * - Render backend
   * - Postman
   */
  app.enableCors({
    origin: (origin, callback) => {
      // allow mobile apps, Postman, server-to-server
      if (!origin) return callback(null, true);

      if (
        origin.startsWith('http://localhost:5173') ||
        origin.startsWith('https://eventz-zeta.vercel.app')
      ) {
        return callback(null, true);
      }

      console.log('❌ Blocked CORS origin:', origin);
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: [
      'GET',
      'HEAD',
      'PUT',
      'PATCH',
      'POST',
      'DELETE',
      'OPTIONS',
    ],
  });

  // global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Backend running on port ${port}`);
}

bootstrap();
