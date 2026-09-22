import { NestFactory } from '@nestjs/core';
import 'reflect-metadata';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CorrelationIdMiddleware } from './middleware/correlation-id.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  // Global prefix and versioning
  app.setGlobalPrefix('api/v1');

  // Enable CORS in composition
  app.enableCors({ origin: '*', methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', credentials: true });

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
