import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { TallyExportService } from './tally.service';
import { Roles } from '../../../decorators/roles.decorator';

@Controller('integrations/tally')
@Roles('ADMIN')
export class TallyExportController {
  constructor(private readonly tallyService: TallyExportService) {}

  @Get('export')
  async exportXml(
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @Query('types') types: string | undefined,
    @Res() res: Response,
  ) {
    const validTypes: ('Purchase' | 'Sales' | 'Receipt')[] = ['Purchase', 'Sales', 'Receipt'];
    const voucherTypes: ('Purchase' | 'Sales' | 'Receipt')[] = types
      ? types.split(',').filter((t): t is 'Purchase' | 'Sales' | 'Receipt' => validTypes.includes(t as any))
      : ['Sales', 'Receipt'];

    const result = await this.tallyService.generateTallyXml({
      from,
      to,
      voucherTypes,
    });

    res.set({
      'Content-Type': 'application/xml',
      'Content-Disposition': `attachment; filename="${result.filename}"`,
      'X-Tally-Total-Vouchers': String(result.stats.totalVouchers),
      'X-Tally-Purchase-Count': String(result.stats.purchaseCount),
      'X-Tally-Sales-Count': String(result.stats.salesCount),
      'X-Tally-Receipt-Count': String(result.stats.receiptCount),
    });

    return res.send(result.xml);
  }

  @Get('summary')
  async getSummary(
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
  ) {
    const result = await this.tallyService.generateTallyXml({ from, to });
    return {
      filename: result.filename,
      stats: result.stats,
      sampleXmlPreview: result.xml.substring(0, 500) + '...',
    };
  }
}
