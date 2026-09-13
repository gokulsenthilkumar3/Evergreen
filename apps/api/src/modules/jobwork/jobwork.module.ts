import { Module } from '@nestjs/common';
import { JobWorkController } from './jobwork.controller';
import { JobWorkService } from './jobwork.service';

@Module({ controllers: [JobWorkController], providers: [JobWorkService] })
export class JobWorkModule {}
