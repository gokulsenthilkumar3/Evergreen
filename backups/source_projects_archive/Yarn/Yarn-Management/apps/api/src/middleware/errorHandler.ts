import type { NextFunction, Request, Response } from 'express';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const errorMessage = err?.message || 'Unknown error';
  console.error(`${new Date().toISOString()} - ${req.method} ${req.path}`, errorMessage);

  const status = typeof err?.status === 'number' ? err.status : 500;
  
  // Don't expose internal error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? status === 500 ? 'Internal Server Error' : errorMessage
    : errorMessage;
  
  // Handle specific Prisma errors
  if (err?.code === 'P2002') {
    return res.status(409).json({ message: 'Resource already exists' });
  }
  
  return res.status(status).json({ message });
}
