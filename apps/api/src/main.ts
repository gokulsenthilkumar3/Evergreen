import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Company logo uploads are limited to 500 KB before base64 encoding.
  app.useBodyParser('json', { limit: '1mb' });
  // Only the loopback web proxy may supply the original client address.
  app.set('trust proxy', 'loopback');

  // Enable CORS with specific configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use(
    helmet({
      frameguard: { action: 'deny' },
      contentSecurityPolicy: { directives: { 'frame-ancestors': ["'none'"] } },
    }),
  );

  // Global validation pipe
  // DTO-backed routes reject unknown fields; legacy any bodies still need DTOs.
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('EverGreen One API')
      .setDescription('EverGreen One development API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.EVERGREEN_API_PORT ?? process.env.PORT ?? 4301;
  const host =
    process.env.EVERGREEN_API_HOST ??
    (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');
  await app.listen(port, host);
  console.log(`🚀 Application is listening on ${host}:${port}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📊 API Documentation: http://localhost:${port}/api/docs`);
  }
}
void bootstrap().catch((error: unknown) => {
  console.error('EverGreen API failed to start:', error);
  process.exitCode = 1;
});
