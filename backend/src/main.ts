import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // API prefix
  app.setGlobalPrefix('api');

  // ✅ CORRECT CORS for Vercel + local
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://eventz-git-main-nandinis-projects-a92240b5.vercel.app',
      'https://eventz-zeta.vercel.app',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

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
