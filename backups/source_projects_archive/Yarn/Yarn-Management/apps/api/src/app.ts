import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import type { Request, Response } from 'express';
import { env } from './config/env';
import { authRouter } from './modules/auth/auth.routes';
import { usersRouter } from './modules/users/users.routes';
import { suppliersRouter } from './modules/suppliers/suppliers.routes';
import { rawMaterialsRouter } from './modules/raw-materials/raw-materials.routes';
import { costOptimizationRouter } from './modules/raw-materials/cost-optimization.routes';
import { customerRouter } from './modules/customers/customer.routes';
import { manufacturingRouter } from './modules/manufacturing/manufacturing.routes';
import { billingRouter } from './modules/billing/billing.routes';
import { finishedGoodsRouter } from './modules/finished-goods/finished-goods.routes';
import { dashboardRouter } from './modules/dashboard/dashboard.routes';
import { notificationRouter } from './modules/notifications/notification.routes';
import { searchRouter } from './modules/search/search.routes';
import importRouter from './modules/import/import.routes';
import { qualityControlRouter } from './modules/quality-control/quality-control.routes';
import { procurementRouter } from './modules/procurement/procurement.routes';
import { portalRouterExport } from './modules/portal/portal.routes';
import { customerPortalRouter } from './modules/customer-portal/customer-portal.routes';
import { planningRouter } from './modules/production/planning.routes';
import { machineRouter } from './modules/production/machine.routes';
import { monitoringRouterExport } from './modules/production/monitoring.routes';
import { efficiencyRouter } from './modules/manufacturing/efficiency.routes';
import { warehouseRouter } from './modules/inventory/warehouse.routes';
import optimizationRouter from './modules/inventory/optimization.routes';
import reconciliationRouter from './modules/inventory/reconciliation.routes';
import { arRouter } from './modules/ar/ar.routes';
import { apRouter } from './modules/ap/ap.routes';
import { budgetRouter } from './modules/ap/budgets.routes';
import { demandForecastingRouter } from './modules/demand-forecasting/demand-forecasting.routes';
import { qualityPredictionRouter } from './modules/quality-prediction/quality-prediction.routes';
import { reportingRouter } from './modules/reporting/reporting.routes';
import { integrationRouter } from './modules/integration/integration.routes';
import { developerRouter } from './modules/developer/developer.routes';
import { gdprRouter } from './modules/gdpr/gdpr.routes';
import { adminRouter } from './modules/admin/admin.routes';
import salesRouter from './modules/sales/sales.routes';
import hrRouter from './modules/hr/hr.routes';
import documentsRouter from './modules/documents/documents.routes';
import communicationRouter from './modules/communication/communication.routes';
import supportRouter from './modules/support/support.routes';
import { newsIntelligenceRouter } from './modules/news-intelligence/news-intelligence.routes';
import appSettingsRouter from './routes/app-settings.routes';
import sessionLogsRouter from './routes/session-logs.routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

export function createApp() {
  // Application Entry Point
  const app = express();

  app.use(
    cors({
      origin: [env.CORS_ORIGIN, 'http://localhost:5174', 'http://localhost:5175'],
      credentials: true,
    })
  );
  app.use(requestLogger);
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
  app.use(compression()); // Enable gzip compression
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));
  app.get('/test-ping', (_req: Request, res: Response) => res.json({ message: 'pong' }));

  app.use('/auth', authRouter);
  app.use('/', importRouter);
  app.use('/users', usersRouter);
  app.use('/suppliers', suppliersRouter);
  app.use('/raw-materials', rawMaterialsRouter);
  app.use('/raw-materials/cost-optimization', costOptimizationRouter);
  app.use('/customers', customerRouter);
  app.use('/manufacturing', manufacturingRouter);
  app.use('/manufacturing/efficiency', efficiencyRouter);
  app.use('/billing', billingRouter);
  app.use('/finished-goods', finishedGoodsRouter);
  app.use('/dashboard', dashboardRouter);
  app.use('/notifications', notificationRouter);
  app.use('/search', searchRouter);
  app.use('/quality-control', qualityControlRouter);
  app.use('/procurement', procurementRouter);
  app.use('/portal', portalRouterExport);
  app.use('/customer-portal', customerPortalRouter);
  app.use('/production', planningRouter);
  app.use('/production', machineRouter);
  app.use('/production', monitoringRouterExport);
  app.use('/inventory', warehouseRouter);
  app.use('/inventory/optimization', optimizationRouter);
  app.use('/inventory/reconciliation', reconciliationRouter);
  app.use('/ar', arRouter);
  app.use('/ap', apRouter);
  app.use('/ap/budgets', budgetRouter);
  app.use('/demand-forecasting', demandForecastingRouter);
  app.use('/quality-prediction', qualityPredictionRouter);
  app.use('/reporting', reportingRouter);
  app.use('/integrations', integrationRouter);
  app.use('/developer', developerRouter);
  app.use('/gdpr', gdprRouter);
  app.use('/admin', adminRouter);
  app.use('/sales', salesRouter);
  app.use('/hr', hrRouter);
  app.use('/documents', documentsRouter);
  app.use('/communication', communicationRouter);
  app.use('/support', supportRouter);
  app.use('/app-settings', appSettingsRouter);
  app.use('/session-logs', sessionLogsRouter);
  app.use('/news-intelligence', newsIntelligenceRouter);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use((req, res, next) => {
    console.log(`404 at ${req.method} ${req.url}`);
    res.status(404).json({ message: 'Not Found' });
  });

  app.use(errorHandler);

  return app;
}
