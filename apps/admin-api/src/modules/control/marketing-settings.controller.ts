import {
  Body,
  ConflictException,
  Controller,
  Get,
  Injectable,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { IsEmail, IsInt, Matches, Min } from 'class-validator';
import { PrismaService } from '../../services/prisma.service';

const ID = 'evergreen-public-marketing-settings';
export const DEFAULT_MARKETING_SETTINGS = {
  salesEmail: 'sales@evergreen.com',
  marketingEmail: 'marketing@evergreen.com',
  licensingEmail: 'licensing@evergreen.com',
  supportEmail: 'support@evergreen.com',
  opensAt: '09:00',
  closesAt: '18:00',
  timeZone: 'Asia/Kolkata',
};
export class MarketingSettingsDto {
  @ApiProperty() @IsEmail() salesEmail!: string;
  @ApiProperty() @IsEmail() marketingEmail!: string;
  @ApiProperty() @IsEmail() licensingEmail!: string;
  @ApiProperty() @IsEmail() supportEmail!: string;
  @ApiProperty({ example: '09:00' })
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
  opensAt!: string;
  @ApiProperty({ example: '18:00' })
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
  closesAt!: string;
  @ApiProperty({ minimum: 0 }) @IsInt() @Min(0) version!: number;
}
@Injectable()
export class MarketingSettingsService {
  constructor(private readonly prisma: PrismaService) {}
  private publicFields(payload: Record<string, unknown>) {
    const defaults = DEFAULT_MARKETING_SETTINGS;
    return Object.fromEntries(
      Object.keys(defaults).map((key) => [
        key,
        typeof payload[key] === 'string'
          ? payload[key]
          : defaults[key as keyof typeof defaults],
      ]),
    );
  }
  async read() {
    const row = await this.prisma.controlRecord.findUnique({
      where: { id: ID },
    });
    return {
      ...this.publicFields(
        row ? (JSON.parse(row.payload) as Record<string, unknown>) : {},
      ),
      version: row?.version || 0,
    };
  }
  async save(body: MarketingSettingsDto, actor: string) {
    if (body.closesAt <= body.opensAt)
      throw new ConflictException(
        'Closing time must be after opening time in IST.',
      );
    const payload = JSON.stringify({
      salesEmail: body.salesEmail.trim(),
      marketingEmail: body.marketingEmail.trim(),
      licensingEmail: body.licensingEmail.trim(),
      supportEmail: body.supportEmail.trim(),
      opensAt: body.opensAt,
      closesAt: body.closesAt,
      timeZone: 'Asia/Kolkata',
    });
    try {
      return await this.prisma.$transaction(async (tx) => {
        const old = await tx.controlRecord.findUnique({ where: { id: ID } });
        if ((old?.version || 0) !== body.version)
          throw new ConflictException(
            'Contact settings changed. Reload before saving.',
          );
        let version = 1;
        if (old) {
          const result = await tx.controlRecord.updateMany({
            where: { id: ID, version: body.version },
            data: { payload, version: { increment: 1 } },
          });
          if (result.count !== 1)
            throw new ConflictException(
              'Contact settings changed. Reload before saving.',
            );
          version = old.version + 1;
        } else
          await tx.controlRecord.create({
            data: {
              id: ID,
              kind: 'PUBLIC_SITE',
              title: 'Marketing contact details',
              status: 'PUBLISHED',
              priority: 'NORMAL',
              owner: actor,
              payload,
            },
          });
        await tx.controlAudit.create({
          data: {
            recordId: ID,
            actor,
            action: 'PUBLIC_CONTACTS_UPDATED',
            details: JSON.stringify({
              version,
              fields: Object.keys(DEFAULT_MARKETING_SETTINGS),
            }),
          },
        });
        return {
          ...this.publicFields(JSON.parse(payload) as Record<string, unknown>),
          version,
        };
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002')
        throw new ConflictException(
          'Contact settings changed. Reload before saving.',
        );
      throw error;
    }
  }
}
@ApiTags('Marketing settings')
@Controller()
export class MarketingSettingsController {
  constructor(private readonly service: MarketingSettingsService) {}
  @Get('public/marketing-settings')
  @ApiOperation({
    summary: 'Public team email addresses and IST office hours only',
    description:
      'Returns an explicit public-field whitelist; no credentials, actor, audit log or provider records. Requires an active provider installation.',
  })
  publicRead() {
    return this.service.read();
  }
  @Get('control/marketing-settings')
  @ApiBearerAuth()
  @ApiCookieAuth('provider-session')
  @ApiOperation({
    summary: 'Read editable public contact settings and concurrency version',
  })
  read() {
    return this.service.read();
  }
  @Post('control/marketing-settings')
  @ApiBearerAuth()
  @ApiCookieAuth('provider-session')
  @ApiOperation({
    summary:
      'Publish team emails and office hours; owner authentication and current version required',
  })
  save(
    @Body() body: MarketingSettingsDto,
    @Req() req: { providerActor: string },
  ) {
    return this.service.save(body, req.providerActor);
  }
}
