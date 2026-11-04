import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { EvidenceService, deriveEvidence, digest } from './evidence.service';
import { PrismaService } from '../../services/prisma.service';
@Controller()
export class OperationsController {
  constructor(
    private readonly evidence: EvidenceService,
    private readonly db: PrismaService,
  ) {}
  @Post('connectors/:id/test') @HttpCode(200) test(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.evidence.probe('record', id, req.providerActor);
  }
  @Post('webhooks/:id/replay') replay(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.evidence.request('WEBHOOK_REPLAY', id, body, req.providerActor);
  }
  @Post('deployments/:id/rollback') rollback(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.evidence.request('ROLLBACK', id, body, req.providerActor);
  }
  @Post('backups/trigger') backup(@Body() body: any, @Req() req: any) {
    return this.evidence.request('BACKUP', 'provider', body, req.providerActor);
  }
  @Post('backups/:id/drill') drill(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.evidence.request('RESTORE_DRILL', id, body, req.providerActor);
  }
  @Post('provision/:step') provision(
    @Param('step') step: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.evidence.request(
      'PROVISION_' + step.toUpperCase(),
      'provider',
      body,
      req.providerActor,
    );
  }
  @Post('topology/:id/probe') @HttpCode(200) probe(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.evidence.probe('company', id, req.providerActor);
  }
  @Get('topology') async topology() {
    const [companies, observations] = await Promise.all([
      this.db.company.findMany({
        select: {
          id: true,
          name: true,
          cloudProvider: true,
          status: true,
          lastSyncAt: true,
        },
      }),
      this.evidence.latest(),
    ]);
    return {
      at: new Date().toISOString(),
      companies: companies.map((c) => ({
        ...c,
        proof: deriveEvidence(
          'recorded',
          observations.find(
            (o) => o.entityType === 'COMPANY' && o.entityId === c.id,
          ),
          digest({ id: c.id }),
        ),
      })),
    };
  }
}
