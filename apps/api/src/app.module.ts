import { AssistantsController } from './modules/assistants/assistants.controller';
import { HelpdeskController, HelpdeskService } from './modules/helpdesk/helpdesk.controller';
import { HelpdeskOperationsController } from './modules/helpdesk/helpdesk-operations.controller';
import { HelpdeskOperationsService } from './modules/helpdesk/helpdesk-operations.service';
import { HelpdeskIngressController } from './modules/helpdesk/helpdesk-ingress';
import { InstallationLeaseService } from './services/installation-lease.service';
import { InstallationLicenseGuard } from './guards/installation-license.guard';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminSyncService } from './services/admin-sync.service';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuthModule } from './modules/auth/auth.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CostingModule } from './modules/costing/costing.module';
import { ProductionModule } from './modules/production/production.module';
import { BillingModule } from './modules/billing/billing.module';
import { LogsModule } from './modules/logs/logs.module';
import { SettingsModule } from './modules/settings/settings.module';
import { SearchModule } from './modules/search/search.module';
import { UsersModule } from './modules/users/users.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { DatabaseModule } from './modules/database/database.module';
import { CommerceModule } from './modules/commerce/commerce.module';
import { JobWorkModule } from './modules/jobwork/jobwork.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { MachineModule } from './modules/machines/machine.module';
import { QualityModule } from './modules/quality/quality.module';
import { HrModule } from './modules/hr/hr.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { AdminOpsModule } from './modules/admin-ops/admin-ops.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { IntegrationsModule } from './modules/integrations/integrations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    IntegrationsModule,
    CommerceModule,
    JobWorkModule,
    DashboardModule,
    AuthModule,
    InventoryModule,
    CostingModule,
    ProductionModule,
    BillingModule,
    LogsModule,
    SettingsModule,
    SearchModule,
    UsersModule,
    SessionsModule,
    // Phase 3.5 — Operational modules
    WarehouseModule,
    MachineModule,
    QualityModule,
    HrModule,
    WorkflowsModule,
    AdminOpsModule,
  ],
  controllers: [AppController, AssistantsController, HelpdeskIngressController, HelpdeskOperationsController, HelpdeskController],
  providers: [
    InstallationLeaseService,
    HelpdeskService,
    HelpdeskOperationsService,
    InstallationLicenseGuard,
    { provide: APP_GUARD, useExisting: InstallationLicenseGuard },
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    AdminSyncService,
  ],
})
export class AppModule {}
