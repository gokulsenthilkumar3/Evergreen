import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, ForbiddenException, HttpException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../services/prisma.service';

/** Record denied writes outside their rolled-back transaction, without storing request bodies. */
@Catch(BadRequestException, ForbiddenException, Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class BusinessActionFilter implements ExceptionFilter {
  constructor(private prisma: PrismaService) {}
  async catch(error: BadRequestException | ForbiddenException | Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientValidationError, host: ArgumentsHost) {
    const request = host.switchToHttp().getRequest(), response = host.switchToHttp().getResponse();
    const code = error instanceof Prisma.PrismaClientKnownRequestError ? error.code : '';
    const status = error instanceof HttpException ? error.getStatus() : code === 'P2025' ? 404 : ['P2002', 'P2028', 'P2034', 'P1008'].includes(code) ? 409 : 400;
    const result = error instanceof HttpException ? error.getResponse() : { statusCode: status, message: code === 'P2002' ? 'This document number or record identity already exists. Check the existing record before posting again.' : code === 'P2025' ? 'The selected source record was not found.' : ['P2028', 'P2034', 'P1008'].includes(code) ? 'Another posting changed this transaction. Retry the same operation with its original request key.' : 'Some entry details or source links are invalid. Check the selected records and field values.' };
    if (request.user && !['GET', 'HEAD'].includes(request.method)) {
      const message = typeof result === 'string' ? result : (result as any).message;
      try { await this.prisma.activityLog.create({ data: { action: 'ACTION_BLOCKED', module: 'BUSINESS', username: request.user.username || 'UNKNOWN', details: JSON.stringify({ method: request.method, path: String(request.path || '').slice(0, 160), status, reason: message }) } }); } catch { /* Original validation response must still be delivered. */ }
    }
    response.status(status).json(typeof result === 'string' ? { statusCode: status, message: result } : result);
  }
}
