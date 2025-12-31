import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set global prefix for all routes
  app.setGlobalPrefix('api');
  
  // Enable CORS
  app.enableCors({
    origin: true, // allow all origins (DEV only - configure for production)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log('🚀 Event Organizer & Ticketing API');
  console.log(`📡 Server running on http://localhost:${port}`);
  console.log(`📚 API endpoints available at http://localhost:${port}/api`);
  console.log('🔥 Ready for testing!');
}
bootstrap();
