import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { loginSchema } from './auth.schemas';
import { login, logout, refresh } from './auth.service';

export const authRouter = Router();

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = loginSchema.parse(req.body);
    console.log('LOGIN ATTEMPT:', { email: body.email, passwordLen: body.password.length, passwordFirstChar: body.password[0], passwordLastChar: body.password[body.password.length - 1] });
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const result = await login(body.email, body.password, ip, userAgent, body.location);

    res.cookie('refresh_token', result.refreshToken, {
      ...cookieOptions,
      expires: result.refreshExpiresAt,
    });

    return res.json({ accessToken: result.accessToken });
  } catch (e) {
    return next(e);
  }
});

authRouter.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refresh_token as string | undefined;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const result = await refresh(token, ip, userAgent);

    res.cookie('refresh_token', result.refreshToken, {
      ...cookieOptions,
      expires: result.refreshExpiresAt,
    });

    return res.json({ accessToken: result.accessToken });
  } catch (e) {
    return next(e);
  }
});

authRouter.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refresh_token as string | undefined;
    await logout(token);
    res.clearCookie('refresh_token', cookieOptions);
    return res.json({ ok: true });
  } catch (e) {
    return next(e);
  }
});

const forgotSchema = z.object({ email: z.string().email() });

authRouter.post(
  '/forgot-password',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      forgotSchema.parse(req.body);
      return res.json({ ok: true });
    } catch (e) {
      return next(e);
    }
  }
);

// --- MFA ---

import { authenticate } from '../../middleware/authenticate';
import {
  setupMfa,
  enableMfa,
  validateMfa,
  createSession, // Import this
} from './auth.service';
import { webAuthnService } from './webauthn.service';
import { prisma } from '../../prisma/client';

authRouter.post('/mfa/setup', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await setupMfa(req.userId!);
    return res.json(result);
  } catch (e) {
    return next(e);
  }
});

authRouter.post('/mfa/enable', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, secret } = z.object({ token: z.string(), secret: z.string() }).parse(req.body);
    await enableMfa(req.userId!, token, secret);
    return res.json({ ok: true });
  } catch (e) {
    return next(e);
  }
});

authRouter.post('/mfa/validate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, token } = z.object({ userId: z.string(), token: z.string() }).parse(req.body);
    const valid = await validateMfa(userId, token);
    if (!valid) return res.status(401).json({ message: 'Invalid MFA code' });
    return res.json({ ok: true });
  } catch (e) {
    return next(e);
  }
});


// --- WebAuthn ---

authRouter.post('/webauthn/register/start', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const options = await webAuthnService.generateRegisterOptions(req.userId!, user?.email || 'User');
    res.json(options);
  } catch (e) { next(e); }
});

authRouter.post('/webauthn/register/finish', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const origin = req.headers.origin || 'http://localhost:5173';
    const result = await webAuthnService.verifyRegister(req.userId!, req.body, origin);
    res.json(result);
  } catch (e) { next(e); }
});

authRouter.post('/webauthn/login/start', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const options = await webAuthnService.generateLoginOptions();
    res.json(options);
  } catch (e) { next(e); }
});

authRouter.post('/webauthn/login/finish', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const origin = req.headers.origin || 'http://localhost:5173';
    const result = await webAuthnService.verifyLogin(req.body, origin);

    const { accessToken, refreshToken, refreshExpiresAt } = await createSession(result.user.id, req.ip || req.socket.remoteAddress, req.headers['user-agent']);

    res.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      expires: refreshExpiresAt,
    });

    res.json({ accessToken });
  } catch (e) { next(e); }
});


// --- Session Management ---

authRouter.get('/sessions', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessions = await prisma.refreshToken.findMany({
      where: { userId: req.userId },
      orderBy: { lastActive: 'desc' }
    });

    res.json(sessions.map(s => ({
      id: s.id,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      lastActive: s.lastActive,
      current: false
    })));
  } catch (e) { next(e); }
});

authRouter.delete('/sessions/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const session = await prisma.refreshToken.findUnique({ where: { id } });
    if (!session || session.userId !== req.userId) return res.status(403).json({ message: 'Forbidden' });

    await prisma.refreshToken.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) { next(e); }
});
