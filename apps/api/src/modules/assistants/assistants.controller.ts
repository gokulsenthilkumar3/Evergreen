import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AgentError, GroqAgents } from '@evergreen/types/ai-server';
import { Public } from '../../decorators/public.decorator';
import { Roles } from '../../decorators/roles.decorator';

@ApiTags('AI assistants')
@Controller('ai')
export class AssistantsController {
  private readonly agents = new GroqAgents();
  @Get('staff')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Staff workflow assistant readiness; never returns a key',
  })
  staffStatus() {
    return this.agents.status('staff');
  }
  @Post('staff')
  @Roles('VIEWER')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Ask Loom for read-only workflow guidance',
    description:
      'Requires staff JWT and active installation. Sends only the supplied conversation to Groq. Has no DB or execution tools.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['message'],
      properties: {
        message: { type: 'string', maxLength: 2000 },
        history: {
          type: 'array',
          maxItems: 8,
          items: {
            type: 'object',
            properties: {
              role: { enum: ['user', 'assistant'] },
              content: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 503, description: 'Groq key has not been configured' })
  @ApiResponse({
    status: 429,
    description: 'Local budget or upstream rate limit reached',
  })
  staff(
    @Body() body: unknown,
    @Req() req: Request & { user: { userId?: number; username: string } },
  ) {
    return this.chat('staff', body, req.user.username);
  }
  @Public()
  @Get('customer')
  @ApiOperation({ summary: 'Customer shop assistant readiness' })
  customerStatus() {
    return this.agents.status('customer');
  }
  @Public()
  @Post('customer')
  @ApiOperation({
    summary: 'Ask Weave about textiles and the shop order flow',
    description:
      'Public, rate limited, active installation required. No customer records or order lookup.',
  })
  customer(@Body() body: unknown, @Req() req: Request) {
    return this.chat('customer', body, req.ip || 'unknown');
  }
  @Public()
  @Get('marketing')
  @ApiOperation({ summary: 'Public product discovery assistant readiness' })
  marketingStatus() {
    return this.agents.status('marketing');
  }
  @Public()
  @Post('marketing')
  @ApiOperation({
    summary: 'Ask Scout about product fit and demo preparation',
    description:
      'Public, rate limited, active installation required. Has no access to business data.',
  })
  marketing(@Body() body: unknown, @Req() req: Request) {
    return this.chat('marketing', body, req.ip || 'unknown');
  }
  private async chat(
    scope: 'staff' | 'customer' | 'marketing',
    body: unknown,
    client: string,
  ) {
    try {
      return await this.agents.chat(scope, body, client);
    } catch (error) {
      if (error instanceof AgentError)
        throw new HttpException(error.message, error.status);
      throw error;
    }
  }
}
