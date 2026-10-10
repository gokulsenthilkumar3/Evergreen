import type { Request } from 'express';

export type AuthenticatedRequest = Request & {
  user: { userId: number; username: string; role: string; sessionId: string };
};
