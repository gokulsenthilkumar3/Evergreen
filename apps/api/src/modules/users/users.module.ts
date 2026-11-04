import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DatabaseModule } from '../database/database.module';
import { DiscoveryModule } from '@nestjs/core';
import { UserAccessController, UserAccessService } from './user-access.controller';
import { SessionPolicyController } from './session-policy.controller';

@Module({
  imports: [DatabaseModule,DiscoveryModule],
  controllers: [UsersController,UserAccessController,SessionPolicyController],
  providers: [UsersService,UserAccessService],
  exports: [UsersService],
})
export class UsersModule {}
