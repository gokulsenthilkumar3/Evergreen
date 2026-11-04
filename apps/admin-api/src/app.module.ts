import { OwnerAssistantController } from './modules/owner-licensing/owner-assistant.controller';
import { MarketingSettingsController, MarketingSettingsService } from './modules/control/marketing-settings.controller';
import { ProviderSessionController } from './modules/owner-licensing/provider-session.controller';
import { OwnerLicensingController } from './modules/owner-licensing/owner-licensing.controller';
import { InstallationLeaseService } from './services/installation-lease.service';
import { InstallationLicenseGuard } from './guards/installation-license.guard';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './modules/database/database.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { CicdModule } from './modules/cicd/cicd.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_GUARD } from '@nestjs/core';
import { ProviderAccessGuard } from './guards/provider-access.guard';
import { ControlModule } from './modules/control/control.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    CompaniesModule,
    CicdModule,
    ControlModule,
  ],
  controllers: [
    AppController,
    OwnerLicensingController,
    ProviderSessionController,
    OwnerAssistantController,
    MarketingSettingsController,
  ],
  providers: [
    InstallationLeaseService,
    MarketingSettingsService,
    { provide: APP_GUARD, useClass: InstallationLicenseGuard },
    AppService,
    { provide: APP_GUARD, useClass: ProviderAccessGuard },
  ],
})
export class AppModule {}
