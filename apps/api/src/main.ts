import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Only the loopback web proxy may supply the original client address.
  app.set('trust proxy', 'loopback');

  // Enable CORS with specific configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Security headers — covers OWASP Top-10 basics.
  // Install @nestjs/helmet for a full production-grade CSP in future.
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload',
    );
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    // Content-Security-Policy: tighten in production via @nestjs/helmet
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; '),
    );
    next();
  });

  // Global validation pipe
  // TODO: Add DTO classes for all mutation endpoints, then enable:
  //   whitelist: true, forbidNonWhitelisted: true
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
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
