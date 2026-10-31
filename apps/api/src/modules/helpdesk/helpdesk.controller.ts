import {
  Body,
  ConflictException,
  Controller,
  Get,
  Injectable,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';
import { PrismaService } from '../../services/prisma.service';
import { Roles } from '../../decorators/roles.decorator';

export class CreateTicketDto {
  @ApiProperty({
    format: 'uuid',
    description:
      'Generate once for a submission and reuse for network retries.',
  })
  @IsUUID()
  requestKey!: string;
  @ApiProperty({ minLength: 3, maxLength: 160 })
  @IsString()
  @Length(3, 160)
  subject!: string;
  @ApiProperty({ minLength: 10, maxLength: 4000 })
  @IsString()
  @Length(10, 4000)
  description!: string;
  @ApiProperty({ enum: ['BUG', 'QUESTION', 'ACCESS', 'INTEGRATION'] })
  @IsIn(['BUG', 'QUESTION', 'ACCESS', 'INTEGRATION'])
  category!: string;
  @ApiProperty({ enum: ['LOW', 'NORMAL', 'HIGH'] })
  @IsIn(['LOW', 'NORMAL', 'HIGH'])
  priority!: string;
}
export class UpdateTicketDto {
  @ApiProperty({ enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED'] })
  @IsIn(['OPEN', 'IN_PROGRESS', 'RESOLVED'])
  status!: string;
  @ApiProperty({ required: false, maxLength: 2000 })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  resolution?: string;
  @ApiProperty({ minimum: 1 }) @IsInt() @Min(1) version!: number;
}
type Actor = { username: string; role: string };
@Injectable()
export class HelpdeskService {
  constructor(private readonly prisma: PrismaService) {}
  list(actor: Actor) {
    return this.prisma.supportTicket.findMany({
      where: actor.role === 'ADMIN' ? {} : { createdBy: actor.username },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });
  }
  async create(body: CreateTicketDto, actor: Actor) {
    const data = {
      subject: body.subject.trim(),
      description: body.description.trim(),
      category: body.category,
      priority: body.priority,
      createdBy: actor.username,
    };
    if (data.subject.length < 3 || data.description.length < 10)
      throw new ConflictException(
        'Describe the issue with a meaningful subject and steps.',
      );
    const existing = await this.prisma.supportTicket.findUnique({
      where: { requestKey: body.requestKey },
    });
    const replay = (row: NonNullable<typeof existing>) => {
      if (
        Object.entries(data).some(
          ([key, value]) => row[key as keyof typeof data] !== value,
        )
      )
        throw new ConflictException(
          'This submission key was already used. Start a new ticket.',
        );
      return row;
    };
    if (existing) return replay(existing);
    try {
      return await this.prisma.supportTicket.create({
        data: { ...data, requestKey: body.requestKey },
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        const row = await this.prisma.supportTicket.findUnique({
          where: { requestKey: body.requestKey },
        });
        if (row) return replay(row);
      }
      throw error;
    }
  }
  async update(id: string, body: UpdateTicketDto) {
    if (body.status === 'RESOLVED' && !body.resolution?.trim())
      throw new ConflictException(
        'Add a resolution before resolving this ticket.',
      );
    const result = await this.prisma.supportTicket.updateMany({
      where: { id, version: body.version },
      data: {
        status: body.status,
        resolution: body.resolution?.trim() || null,
        version: { increment: 1 },
      },
    });
    if (result.count !== 1) {
      const existing = await this.prisma.supportTicket.findUnique({
        where: { id },
      });
      if (!existing) throw new NotFoundException('Ticket not found');
      throw new ConflictException('The ticket changed. Refresh before saving.');
    }
    return this.prisma.supportTicket.findUniqueOrThrow({ where: { id } });
  }
}
@ApiTags('Helpdesk')
@ApiBearerAuth()
@Controller('helpdesk/tickets')
export class HelpdeskController {
  constructor(private readonly service: HelpdeskService) {}
  @Get()
  @ApiOperation({
    summary: 'List your tickets; administrators can see the installation queue',
    description:
      'Maximum 100, ordered by last update. Tickets remain within this installation and are not sent to external support.',
  })
  list(@Req() req: { user: Actor }) {
    return this.service.list(req.user);
  }
  @Post()
  @Roles('VIEWER')
  @ApiOperation({
    summary:
      'Create an installation support ticket with retry-safe submission key',
  })
  create(@Body() body: CreateTicketDto, @Req() req: { user: Actor }) {
    return this.service.create(body, req.user);
  }
  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Update ticket status and resolution; administrators only',
    description:
      'Supply the current version. Returns 409 on concurrent changes. Resolving requires a resolution note.',
  })
  update(@Param('id') id: string, @Body() body: UpdateTicketDto) {
    return this.service.update(id, body);
  }
}
