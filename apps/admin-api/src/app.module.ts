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
  controllers: [AppController],
  providers: [AppService, { provide:APP_GUARD, useClass:ProviderAccessGuard }],
})
export class AppModule {}
