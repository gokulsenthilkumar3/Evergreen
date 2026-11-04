import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { TallyExportService } from './tally.service';
import { Roles } from '../../../decorators/roles.decorator';

@Controller('integrations/tally')
@Roles('ADMIN')
export class TallyExportController {
  constructor(private readonly tallyService: TallyExportService) {}

  private parseTypes(types?: string): ('Sales' | 'Receipt')[] {
    if (types === undefined) return ['Sales', 'Receipt'];
    if (typeof types !== 'string')
      throw new BadRequestException(
        'Voucher types must be a comma-separated string',
      );
    const values = [...new Set(types.split(','))];
    if (
      !values.length ||
      values.some((value) => value !== 'Sales' && value !== 'Receipt')
    )
      throw new BadRequestException(
        'Choose Sales, Receipt or both. Purchase export is not available.',
      );
    return values as ('Sales' | 'Receipt')[];
  }

  @Get('export')
  async exportXml(
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @Query('types') types: string | undefined,
    @Res() res: Response,
  ) {
    const voucherTypes = this.parseTypes(types);

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
    @Query('types') types?: string,
  ) {
    const result = await this.tallyService.generateTallyXml({
      from,
      to,
      voucherTypes: this.parseTypes(types),
    });
    return {
      filename: result.filename,
      stats: result.stats,
      sampleXmlPreview: result.xml.substring(0, 500) + '...',
    };
  }
}
