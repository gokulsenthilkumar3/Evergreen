import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import { Prisma } from '@prisma/admin-client';
import type { Response } from 'express';
import { PrismaService } from '../services/prisma.service';

/** Translate provider persistence errors using the provider's generated client. */
@Catch(
  BadRequestException,
  ForbiddenException,
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientValidationError,
)
export class BusinessActionFilter implements ExceptionFilter {
  constructor(private prisma: PrismaService) {}
  catch(
    error:
      | BadRequestException
      | ForbiddenException
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientValidationError,
    host: ArgumentsHost,
  ) {
    const response = host.switchToHttp().getResponse<Response>();
    const code =
      error instanceof Prisma.PrismaClientKnownRequestError ? error.code : '';
    const status =
      error instanceof HttpException
        ? error.getStatus()
        : code === 'P2025'
          ? 404
          : ['P2002', 'P2028', 'P2034', 'P1008'].includes(code)
            ? 409
            : 400;
    const result =
      error instanceof HttpException
        ? error.getResponse()
        : {
            statusCode: status,
            message:
              code === 'P2002'
                ? 'This document number or record identity already exists. Check the existing record before posting again.'
                : code === 'P2025'
                  ? 'The selected source record was not found.'
                  : ['P2028', 'P2034', 'P1008'].includes(code)
                    ? 'Another posting changed this transaction. Retry the same operation with its original request key.'
                    : 'Some entry details or source links are invalid. Check the selected records and field values.',
          };
    response
      .status(status)
      .json(
        typeof result === 'string'
          ? { statusCode: status, message: result }
          : result,
      );
  }
}
