import { refreshInstallationLease } from '@evergreen/types/licensing-online';
import { ownerGroqEnvironment } from '@evergreen/types/ai-server';
import { upgradeApiReference } from './api-reference';
import { observeApi, serveMonitor } from './api-monitor';
import {
  requireInstallationLicence,
  ownerHostEnvironment,
} from '@evergreen/types/licensing';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import type { NextFunction, Request, Response } from 'express';
import { NotFoundExceptionFilter } from './filters/not-found-exception.filter';
import { BusinessActionFilter } from './filters/business-action.filter';
import { PrismaService } from './services/prisma.service';

async function bootstrap() {
  Object.assign(process.env, ownerHostEnvironment('tenant'));
  Object.assign(process.env, ownerGroqEnvironment());
  try {
    await refreshInstallationLease('tenant');
  } catch {
    /* Existing signed offline access is checked below. */
  }
  requireInstallationLicence('tenant');
  if (process.env.AUTO_MIGRATE === 'true') {
    throw new Error(
      'AUTO_MIGRATE is no longer supported. Use the release deployment helper to snapshot and migrate the selected database.',
    );
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableShutdownHooks();
  app.use(observeApi);
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
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
          ],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https:', 'data:'],
          imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
          connectSrc: ["'self'", 'http:', 'https:', 'ws:'],
        },
      },
    }),
  );

  // Strict No-Cache headers to ensure real-time auto-synchronization across all services
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    );
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
  app.useGlobalFilters(
    new NotFoundExceptionFilter(),
    new BusinessActionFilter(app.get(PrismaService)),
  );

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('EverGreen One API')
      .setDescription(
        `EverGreen One operational API & Developer Explorer.

**Business Workflow:** Issuer Settings → Receive Raw Cotton → Production & Waste → Review Inventory → Commerce Orders & Invoices → Ledger & Payments.

Authorize with your own staff bearer token for protected endpoints. Try it out executes real operations against the configured database.`,
      )
      .setVersion('1.0.0')
      .addServer('/api/backend', 'Public web proxy (recommended: port 4000)')
      .addServer('/', 'Direct API connection (port 4301)')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your EverGreen JWT bearer token',
        in: 'header',
      })
      .addTag(
        'Health & Processors',
        'System health checks, live processor status, telemetry & synchronization',
      )
      .addTag(
        'Auth & Security',
        'User authentication, session guards, passkeys & role access',
      )
      .addTag(
        'Costing & EB',
        'Electricity unit rates, packaging, labor & per-kg manufacturing calculations',
      )
      .addTag(
        'Billing & Invoicing',
        'GST tax invoices, payment reconciliation & digital verification',
      )
      .addTag(
        'Production & Spinning',
        'Daily shift production, blow room loss & spinning operations',
      )
      .addTag(
        'Warehouse & Inventory',
        'Bales, yarn bags, bay storage & stock movement',
      )
      .addTag(
        'Quality & QC Lab',
        'CSP lea testing, count verification & defect analysis',
      )
      .addTag(
        'Machinery & Telemetry',
        'Machine inventory, inspection schedules & uptime logs',
      )
      .addTag(
        'HR & Payroll',
        'Staff directory, shift rosters & wage disbursement',
      )
      .build();
    const document = upgradeApiReference(app, SwaggerModule.createDocument(app, config), 'tenant');
    app.getHttpAdapter().get('/internal/api-monitor', serveMonitor(document));
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle:
        'EverGreen One — API Documentation & Interactive Explorer',
      swaggerOptions: {
        persistAuthorization: false,
        docExpansion: 'none',
        displayOperationId: true,
        requestSnippetsEnabled: true,
        filter: true,
        displayRequestDuration: true,
        tryItOutEnabled: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
        defaultModelsExpandDepth: 1,
      },
      customCss: `
        .swagger-ui .wrapper { max-width: 1440px !important; padding: 0 32px !important; }
        .swagger-ui .information-container { padding: 28px 0 12px; }
        .swagger-ui .info .title { font-size: clamp(26px, 4vw, 42px) !important; letter-spacing: -1px; }
        .swagger-ui .opblock-tag { padding: 20px 12px !important; border-bottom: 1px solid #334155 !important; }
        .swagger-ui .opblock-summary { min-height: 58px; gap: 12px; }
        .swagger-ui .filter-container { position: sticky; top: 0; z-index: 10; background: #080d1a; padding: 16px 0; }
        .swagger-ui .operation-filter-input { min-height: 48px; border-radius: 10px !important; }
        .swagger-ui button:focus-visible, .swagger-ui a:focus-visible { outline: 3px solid #34d399 !important; outline-offset: 4px; }
        @media(max-width: 640px) { .swagger-ui .wrapper { padding: 0 12px !important; } .swagger-ui .opblock-summary { flex-wrap: wrap; } .swagger-ui .opblock-summary-path { max-width: 100% !important; overflow-wrap: anywhere; } }
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
        
        body, html, .swagger-ui {
          background-color: #080d1a !important;
          color: #f8fafc !important;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif !important;
        }
        
        .swagger-ui .topbar {
          background-color: #0b1120 !important;
          border-bottom: 1px solid rgba(16, 185, 129, 0.3) !important;
          padding: 12px 24px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;
        }
        .swagger-ui .topbar .download-url-wrapper { display: none !important; }
        .swagger-ui .topbar .topbar-wrapper {
          display: flex !important;
          align-items: center !important;
        }
        .swagger-ui .topbar .topbar-wrapper a {
          display: flex !important;
          align-items: center !important;
          font-weight: 800 !important;
          color: #34d399 !important;
          text-decoration: none !important;
          font-size: 1.15rem !important;
        }
        
        .swagger-ui .info {
          margin: 30px 0 20px 0 !important;
          padding: 24px !important;
          background: rgba(18, 26, 43, 0.75) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 16px !important;
          backdrop-filter: blur(12px) !important;
        }
        .swagger-ui .info .title {
          color: #10b981 !important;
          font-weight: 800 !important;
          font-size: 2.2rem !important;
          letter-spacing: -0.02em !important;
        }
        .swagger-ui .info p, .swagger-ui .info li, .swagger-ui .info td {
          color: #94a3b8 !important;
          font-size: 0.92rem !important;
          line-height: 1.6 !important;
        }
        .swagger-ui .info .version {
          background: rgba(16, 185, 129, 0.2) !important;
          color: #34d399 !important;
          border: 1px solid rgba(16, 185, 129, 0.4) !important;
          border-radius: 999px !important;
          padding: 4px 12px !important;
          font-weight: 700 !important;
        }
        
        .swagger-ui .scheme-container {
          background: rgba(14, 20, 32, 0.9) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 12px !important;
          padding: 16px 20px !important;
          margin: 20px 0 !important;
          box-shadow: none !important;
        }
        .swagger-ui .scheme-container label {
          color: #cbd5e1 !important;
          font-weight: 600 !important;
        }
        .swagger-ui .scheme-container select {
          background: #090e17 !important;
          color: #f8fafc !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          border-radius: 8px !important;
          padding: 6px 12px !important;
        }
        
        .swagger-ui .btn.authorize {
          color: #10b981 !important;
          border-color: #10b981 !important;
          background: rgba(16, 185, 129, 0.1) !important;
          border-radius: 8px !important;
          font-weight: 700 !important;
          transition: all 0.2s !important;
        }
        .swagger-ui .btn.authorize:hover {
          background: rgba(16, 185, 129, 0.2) !important;
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.3) !important;
        }
        .swagger-ui .btn.authorize svg { fill: #10b981 !important; }
        
        .swagger-ui .filter .operation-filter-input {
          background: #090e17 !important;
          color: #f8fafc !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          border-radius: 10px !important;
          padding: 10px 14px !important;
          font-family: inherit !important;
        }
        .swagger-ui .filter .operation-filter-input:focus {
          border-color: #10b981 !important;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important;
        }
        
        /* Operation Blocks */
        .swagger-ui .opblock {
          border-radius: 12px !important;
          margin-bottom: 12px !important;
          background: rgba(18, 26, 43, 0.6) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2) !important;
          overflow: hidden !important;
        }
        .swagger-ui .opblock .opblock-summary {
          padding: 10px 16px !important;
        }
        .swagger-ui .opblock .opblock-summary-method {
          border-radius: 8px !important;
          font-family: 'JetBrains Mono', monospace !important;
          font-weight: 700 !important;
          font-size: 0.8rem !important;
          min-width: 80px !important;
          text-align: center !important;
        }
        .swagger-ui .opblock .opblock-summary-path,
        .swagger-ui .opblock .opblock-summary-path__deprecated {
          color: #f8fafc !important;
          font-family: 'JetBrains Mono', monospace !important;
          font-size: 0.9rem !important;
        }
        .swagger-ui .opblock .opblock-summary-description {
          color: #94a3b8 !important;
          font-size: 0.85rem !important;
        }
        
        /* Method Styles */
        .swagger-ui .opblock.opblock-get {
          border-color: rgba(16, 185, 129, 0.35) !important;
          background: rgba(16, 185, 129, 0.04) !important;
        }
        .swagger-ui .opblock.opblock-get .opblock-summary-method {
          background: linear-gradient(135deg, #10b981, #059669) !important;
          color: #fff !important;
        }
        
        .swagger-ui .opblock.opblock-post {
          border-color: rgba(59, 130, 246, 0.35) !important;
          background: rgba(59, 130, 246, 0.04) !important;
        }
        .swagger-ui .opblock.opblock-post .opblock-summary-method {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
          color: #fff !important;
        }
        
        .swagger-ui .opblock.opblock-put {
          border-color: rgba(245, 158, 11, 0.35) !important;
          background: rgba(245, 158, 11, 0.04) !important;
        }
        .swagger-ui .opblock.opblock-put .opblock-summary-method {
          background: linear-gradient(135deg, #f59e0b, #b45309) !important;
          color: #fff !important;
        }
        
        .swagger-ui .opblock.opblock-delete {
          border-color: rgba(244, 63, 94, 0.35) !important;
          background: rgba(244, 63, 94, 0.04) !important;
        }
        .swagger-ui .opblock.opblock-delete .opblock-summary-method {
          background: linear-gradient(135deg, #f43f5e, #be123c) !important;
          color: #fff !important;
        }
        
        .swagger-ui .opblock.opblock-patch {
          border-color: rgba(168, 85, 247, 0.35) !important;
          background: rgba(168, 85, 247, 0.04) !important;
        }
        .swagger-ui .opblock.opblock-patch .opblock-summary-method {
          background: linear-gradient(135deg, #a855f7, #7e22ce) !important;
          color: #fff !important;
        }
        
        .swagger-ui .opblock-body {
          background: rgba(11, 17, 32, 0.9) !important;
          color: #cbd5e1 !important;
        }
        .swagger-ui .opblock-description-wrapper p,
        .swagger-ui .opblock-external-docs-wrapper p,
        .swagger-ui .opblock-title_normal p {
          color: #cbd5e1 !important;
        }
        
        /* Parameters & Tables */
        .swagger-ui table thead tr td, .swagger-ui table thead tr th {
          color: #94a3b8 !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          font-family: 'JetBrains Mono', monospace !important;
          font-size: 0.75rem !important;
        }
        .swagger-ui .parameters-col_name {
          color: #f8fafc !important;
          font-family: 'JetBrains Mono', monospace !important;
        }
        .swagger-ui .parameter__name.required:after {
          color: #fb7185 !important;
        }
        .swagger-ui .parameter__type {
          color: #38bdf8 !important;
          font-family: 'JetBrains Mono', monospace !important;
        }
        .swagger-ui input[type=text], .swagger-ui select, .swagger-ui textarea {
          background: #090e17 !important;
          color: #f8fafc !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          border-radius: 8px !important;
          padding: 8px 12px !important;
          font-family: inherit !important;
        }
        .swagger-ui input[type=text]:focus, .swagger-ui textarea:focus {
          border-color: #10b981 !important;
        }
        
        /* Execute & Buttons */
        .swagger-ui .btn.execute {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
          color: white !important;
          border: none !important;
          border-radius: 8px !important;
          font-weight: 700 !important;
          padding: 8px 24px !important;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3) !important;
        }
        .swagger-ui .btn.execute:hover {
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5) !important;
          transform: translateY(-1px) !important;
        }
        .swagger-ui .btn.cancel {
          background: rgba(244, 63, 94, 0.15) !important;
          color: #fb7185 !important;
          border: 1px solid rgba(244, 63, 94, 0.3) !important;
          border-radius: 8px !important;
        }
        
        /* Response Block */
        .swagger-ui .responses-inner {
          background: transparent !important;
        }
        .swagger-ui .responses-table {
          background: transparent !important;
        }
        .swagger-ui .response-col_status {
          font-family: 'JetBrains Mono', monospace !important;
          font-weight: 700 !important;
        }
        .swagger-ui .response-col_links {
          color: #94a3b8 !important;
        }
        .swagger-ui .highlight-code {
          background: #050811 !important;
          border-radius: 8px !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
        }
        .swagger-ui .microlight {
          background: #050811 !important;
          color: #38bdf8 !important;
          font-family: 'JetBrains Mono', monospace !important;
          font-size: 0.85rem !important;
        }
        
        /* Models & Schemas */
        .swagger-ui section.models {
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 14px !important;
          background: rgba(14, 20, 32, 0.8) !important;
          margin-top: 30px !important;
        }
        .swagger-ui section.models h4 {
          color: #10b981 !important;
          font-weight: 800 !important;
        }
        .swagger-ui .model-box {
          background: rgba(9, 14, 23, 0.7) !important;
          border-radius: 8px !important;
        }
        .swagger-ui .model-title {
          color: #f8fafc !important;
        }
        .swagger-ui .model {
          color: #cbd5e1 !important;
          font-family: 'JetBrains Mono', monospace !important;
        }
        .swagger-ui .prop-type {
          color: #38bdf8 !important;
        }
        
        /* Tag sections */
        .swagger-ui .opblock-tag {
          color: #f8fafc !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
          font-weight: 700 !important;
          padding: 16px 0 !important;
        }
        .swagger-ui .opblock-tag small {
          color: #94a3b8 !important;
        }
        
        /* Modals (Authorize) */
        .swagger-ui .dialog-ux .modal-ux {
          background: #0b1120 !important;
          border: 1px solid rgba(16, 185, 129, 0.4) !important;
          border-radius: 16px !important;
          box-shadow: 0 20px 50px rgba(0,0,0,0.8) !important;
        }
        .swagger-ui .dialog-ux .modal-ux-header {
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
        }
        .swagger-ui .dialog-ux .modal-ux-header h3 {
          color: #10b981 !important;
          font-weight: 800 !important;
        }
        .swagger-ui .dialog-ux .modal-ux-content {
          color: #cbd5e1 !important;
        }
        .swagger-ui .dialog-ux .modal-ux-content p {
          color: #94a3b8 !important;
        }
      `,
    });
  }

  const port = process.env.EVERGREEN_API_PORT ?? process.env.PORT ?? 4301;
  const host =
    process.env.EVERGREEN_API_HOST ??
    (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');
  await app.listen(Number(port), host);
  if (process.env.EVERGREEN_DESKTOP === 'true' && process.send) {
    process.on('message', (message: { type?: string }) => {
      if (message?.type === 'evergreen-shutdown') {
        void app.close().then(() => process.exit(0));
      }
    });
    const address = app.getHttpServer().address();
    if (!address || typeof address === 'string')
      throw new Error('Local API did not bind a TCP port');
    process.send({ type: 'evergreen-ready', port: address.port });
  }
  console.log(`🚀 Application is listening on ${host}:${port}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📊 API Documentation: http://localhost:${port}/api/docs`);
  }
}
void bootstrap().catch((error: unknown) => {
  console.error('EverGreen API failed to start:', error);
  process.exitCode = 1;
});
