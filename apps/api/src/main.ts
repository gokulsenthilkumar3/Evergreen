import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { NotFoundExceptionFilter } from './filters/not-found-exception.filter';

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
      hidePoweredBy: true,
      frameguard: { action: 'deny' },
      contentSecurityPolicy: {
        directives: {
          'frame-ancestors': ["'none'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          scriptSrcAttr: ["'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https:', 'data:'],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'http:', 'https:', 'ws:'],
        },
      },
    }),
  );

  // Strict No-Cache headers to ensure real-time auto-synchronization across all services
  app.use((_req: any, res: any, next: any) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
  });

  // Global validation pipe
  // DTO-backed routes reject unknown fields; legacy any bodies still need DTOs.
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global 404 Exception Filter
  app.useGlobalFilters(new NotFoundExceptionFilter());

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('EverGreen One API')
      .setDescription(`EverGreen One operational API.\n\nBusiness flow: configure issuer settings → receive material → record production and waste → review available stock → create a commerce order/invoice → record invoice payments → review the customer ledger.\n\nUse /commerce for catalogue sales, invoices and customer payments. Legacy mill inventory and commerce stock require reconciliation; do not assume all movements are synchronized.\n\nAuthorize with a staff bearer token for protected endpoints. Try it out executes real requests against this database. Health: /health?format=json. In-app workflow guide: /tutorial.`)
      .setVersion('1.0.0')
      .addServer('/api/backend', 'Public web proxy (recommended)')
      .addServer('/', 'Direct API connection')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your EverGreen JWT bearer token',
        in: 'header',
      })
      .addTag('Health & Processors', 'System health checks, live processor status, telemetry & synchronization')
      .addTag('Auth & Security', 'User authentication, session guards, passkeys & role access')
      .addTag('Costing & EB', 'Electricity unit rates, packaging, labor & per-kg manufacturing calculations')
      .addTag('Billing & Invoicing', 'GST tax invoices, payment reconciliation & digital verification')
      .addTag('Production & Spinning', 'Daily shift production, blow room loss & spinning operations')
      .addTag('Warehouse & Inventory', 'Bales, yarn bags, bay storage & stock movement')
      .addTag('Quality & QC Lab', 'CSP lea testing, count verification & defect analysis')
      .addTag('Machinery & Telemetry', 'Machine inventory, inspection schedules & uptime logs')
      .addTag('HR & Payroll', 'Staff directory, shift rosters & wage disbursement')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'EverGreen One — API Documentation & Explorer',
      swaggerOptions: {
        persistAuthorization: false,
        docExpansion: 'list',
        filter: true,
        displayRequestDuration: true,
        tryItOutEnabled: false,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
      customCss: `
        .swagger-ui .topbar { background-color: #0f172a; border-bottom: 2px solid #10b981; }
        .swagger-ui .topbar .download-url-wrapper { display: none; }
        .swagger-ui .info { margin: 24px 0; }
        .swagger-ui .info .title { color: #10b981; font-weight: 800; }
        .swagger-ui .scheme-container { background: #f8fafc; padding: 15px 0; }
        .swagger-ui .btn.authorize { color: #10b981; border-color: #10b981; }
        .swagger-ui .btn.authorize svg { fill: #10b981; }
      `,
    });
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
