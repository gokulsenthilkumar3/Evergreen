import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
