import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


import { ConfigService } from '@nestjs/config';
import { CorrelationIdMiddleware } from './middleware/correlation-id.middleware';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  // Global prefix and versioning
  app.setGlobalPrefix('api/v1');

  // Security middlewares
  app.use(helmet());
  const corsOrigin = configService.get<string>('CORS_ORIGIN') || 'http://localhost:3000';
  app.enableCors({ origin: corsOrigin, methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', credentials: true });
  // Rate limiting on auth login endpoint
  app.use('/api/v1/auth/login', rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: 'Too many login attempts, please try later.',
  }));

  // Request-validation pipe (simple example)
  // app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  // Swagger docs
  const configBuilder = new DocumentBuilder()
    .setTitle('Interview Coach API')
    .setDescription('API for Interview Coach platform')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('users')
    .addTag('questions')
    .build();
  const document = SwaggerModule.createDocument(app, configBuilder);
  SwaggerModule.setup('docs', app, document);

  // Middleware for correlation id
  app.use(new CorrelationIdMiddleware().use);

  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port);
  console.log(`API listening on http://localhost:${port}\nSwagger at /docs`);
}

bootstrap();
