import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ ALL APIs will be under /api
  app.setGlobalPrefix('api');

  // ✅ CORS: allow Vercel + localhost
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://eventz-zeta.vercel.app/', // 🔴 CHANGE if your Vercel URL is different
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ✅ Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log('🚀 Eventz Backend Running');
  console.log(`🌍 Port: ${port}`);
  console.log(`📡 API Base: /api`);
}

bootstrap();
