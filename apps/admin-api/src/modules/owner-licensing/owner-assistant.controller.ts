import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AgentError, GroqAgents } from '@evergreen/types/ai-server';

@ApiTags('Owner assistant')
@ApiCookieAuth('provider-session')
@Controller('ai/owner')
export class OwnerAssistantController {
  private readonly agents = new GroqAgents();
  @Get()
  @ApiOperation({ summary: 'Atlas readiness; requires owner authentication' })
  status() {
    return this.agents.status('owner');
  }
  @Post()
  @ApiOperation({
    summary: 'Ask Atlas for owner operations guidance',
    description:
      'Requires owner session/key and ADMIN installation scope. Advisory only: no licence issuance, deployment, SQL or filesystem execution. Only your supplied conversation is sent to Groq.',
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
  @ApiResponse({ status: 503, description: 'Groq is not configured' })
  @ApiResponse({
    status: 429,
    description: 'Local budget or Groq rate limit reached',
  })
  async chat(@Body() body: unknown, @Req() req: Request) {
    try {
      return await this.agents.chat('owner', body, req.ip || 'owner');
    } catch (error) {
      if (error instanceof AgentError)
        throw new HttpException(error.message, error.status);
      throw error;
    }
  }
}
