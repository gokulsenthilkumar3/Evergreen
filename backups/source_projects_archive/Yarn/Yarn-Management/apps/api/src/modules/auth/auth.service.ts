import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { prisma } from '../../prisma/client';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { recordAuditLog, AuditAction } from '../../utils/audit';
import { UAParser } from 'ua-parser-js';
import { v4 as uuidv4 } from 'uuid';




function daysToMs(days: number) {
  return days * 24 * 60 * 60 * 1000;
}

function signAccessToken(userId: string, sessionId?: string) {
  return jwt.sign({ sub: userId, sid: sessionId }, String(env.JWT_ACCESS_SECRET), {
    expiresIn: String(env.JWT_ACCESS_EXPIRES_IN) as any,
  });
}

function signRefreshToken(userId: string) {
  const expiresAt = new Date(Date.now() + daysToMs(env.JWT_REFRESH_EXPIRES_IN_DAYS));
  const raw = jwt.sign({ sub: userId }, String(env.JWT_REFRESH_SECRET), {
    expiresIn: `${env.JWT_REFRESH_EXPIRES_IN_DAYS}d` as any,
  });
  return { raw, expiresAt };
}

async function hashToken(token: string) {
  return bcrypt.hash(token, 10);
}

async function verifyTokenHash(token: string, tokenHash: string) {
  return bcrypt.compare(token, tokenHash);
}

// Helper to parsing UA
function parseDeviceName(userAgent?: string): string {
  if (!userAgent) return 'Unknown Device';
  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  return `${browser.name || 'Unknown Browser'} on ${os.name || 'Unknown OS'}`;
}

// Helper to get location from IP
async function getLocationFromIp(ip?: string): Promise<string | null> {
  if (!ip || ip === '::1' || ip === '127.0.0.1') return 'Localhost';

  try {
    // Using ip-api.com (free, no key required for low volume)
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();
    if (data.status === 'success') {
      return `${data.city}, ${data.country}`;
    }
  } catch (e) {
    // Ignore errors, return null
  }
  return null;
}

// Helper to get location from Coords (GPS)
async function getLocationFromCoords(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
      headers: {
        'User-Agent': 'YarnManagement/1.0'
      }
    });
    const data = await response.json();
    if (data && data.address) {
      const city = data.address.city || data.address.town || data.address.village;
      const country = data.address.country;
      if (city && country) return `${city}, ${country} (GPS)`;
      if (country) return `${country} (GPS)`;
    }
  } catch (e) {
    // Ignore
  }
  return null;
}

export async function login(email: string, password: string, ip?: string, userAgent?: string, coords?: { lat: number; lng: number }) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      passwordHash: true,
      status: true,
      failedLoginAttempts: true,
      lockoutUntil: true
    },
  });

  if (!user || !user.passwordHash) {
    await recordAuditLog(AuditAction.LOGIN_FAILURE, { metadata: { email }, ip, userAgent });
    const err: any = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  if (user.status === 'DISABLED') {
    await recordAuditLog(AuditAction.LOGIN_FAILURE, { userId: user.id, metadata: { reason: 'ACCOUNT_DISABLED' }, ip, userAgent });
    const err: any = new Error('Account disabled');
    err.status = 403;
    throw err;
  }

  if (user.lockoutUntil && user.lockoutUntil > new Date()) {
    await recordAuditLog(AuditAction.LOGIN_FAILURE, { userId: user.id, metadata: { reason: 'ACCOUNT_LOCKED' }, ip, userAgent });
    const err: any = new Error(`Account locked. Try again after ${user.lockoutUntil.toLocaleTimeString()}`);
    err.status = 403;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const attempts = user.failedLoginAttempts + 1;
    const lockoutUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: attempts,
        lockoutUntil: lockoutUntil
      }
    });

    if (lockoutUntil) {
      await recordAuditLog(AuditAction.ACCOUNT_LOCKED, { userId: user.id, ip, userAgent });
    }

    await recordAuditLog(AuditAction.LOGIN_FAILURE, { userId: user.id, metadata: { attempts }, ip, userAgent });

    const err: any = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  // Reset login failures on success
  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockoutUntil: null }
  });

  await recordAuditLog(AuditAction.LOGIN_SUCCESS, { userId: user.id, ip, userAgent });

  // Device management
  if (userAgent) {
    await recordDeviceActivity(user.id, ip, userAgent);
  }

  let locationOverride: string | undefined;
  if (coords) {
    const gpsLoc = await getLocationFromCoords(coords.lat, coords.lng);
    if (gpsLoc) locationOverride = gpsLoc;
  }

  return createSession(user.id, ip, userAgent, locationOverride);
}

async function recordDeviceActivity(userId: string, ip?: string, userAgent?: string) {
  if (!userAgent) return;

  const deviceName = parseDeviceName(userAgent);

  // We'll use a simple deterministic "fingerprint" for now
  // In prod, use a more robust fingerprinting library or client-side permanent storage
  const deviceId = Buffer.from(`${userAgent}-${ip || 'unknown'}`).toString('base64');

  const existing = await prisma.trustedDevice.findUnique({
    where: { deviceId }
  });

  if (existing) {
    await prisma.trustedDevice.update({
      where: { id: existing.id },
      data: { lastUsed: new Date(), name: deviceName }
    });
  } else {
    await prisma.trustedDevice.create({
      data: {
        userId,
        deviceId,
        name: deviceName,
        lastUsed: new Date()
      }
    });
    // Here we could send an alert "New device logged in"
    console.log(`New trusted device registered for user ${userId}: ${deviceName}`);
  }
}

export async function createSession(userId: string, ip?: string, userAgent?: string, locationOverride?: string) {
  // Enforce session limits
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { maxSessions: true }
  });

  const maxSessions = user?.maxSessions || 5;

  const activeSessions = await prisma.refreshToken.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' }
  });

  if (activeSessions.length >= maxSessions) {
    const sessionsToRemove = activeSessions.slice(0, activeSessions.length - maxSessions + 1);
    await prisma.refreshToken.deleteMany({
      where: { id: { in: sessionsToRemove.map(s => s.id) } }
    });
  }

  const refresh = signRefreshToken(userId);
  const tokenHash = await hashToken(refresh.raw);

  const refreshTokenEntry = await prisma.refreshToken.create({
    data: {
      userId: userId,
      tokenHash,
      expiresAt: refresh.expiresAt,
      ipAddress: ip,
      userAgent: userAgent,
      lastActive: new Date()
    },
  });

  const accessToken = signAccessToken(userId, refreshTokenEntry.id);

  // Create Session Log
  try {
    const location = locationOverride || await getLocationFromIp(ip);
    await prisma.sessionLog.create({
      data: {
        userId,
        sessionToken: tokenHash,
        deviceInfo: parseDeviceName(userAgent),
        ipAddress: ip || 'Unknown',
        location,
        isActive: true,
        loginAt: new Date()
      }
    });
  } catch (logErr) {
    console.error('Failed to create session log:', logErr);
  }

  return { accessToken, refreshToken: refresh.raw, refreshExpiresAt: refresh.expiresAt };
}

export async function refresh(refreshToken: string, ip?: string, userAgent?: string) {
  let decoded: any;
  try {
    decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { sub: string };
  } catch {
    const err: any = new Error('Invalid refresh token');
    err.status = 401;
    throw err;
  }

  const userId = decoded.sub as string;

  const candidates = await prisma.refreshToken.findMany({
    where: {
      userId,
      expiresAt: { gt: new Date() },
    },
    select: { id: true, tokenHash: true },
  });

  const match = await (async () => {
    for (const c of candidates) {
      const ok = await verifyTokenHash(refreshToken, c.tokenHash);
      if (ok) return c;
    }
    return null;
  })();

  if (!match) {
    const err: any = new Error('Invalid refresh token');
    err.status = 401;
    throw err;
  }

  // Delete old token (rotate)
  await prisma.refreshToken.delete({ where: { id: match.id } });

  const newRefresh = signRefreshToken(userId);
  const newTokenHash = await hashToken(newRefresh.raw);

  const refreshTokenEntry = await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: newTokenHash,
      expiresAt: newRefresh.expiresAt,
      ipAddress: ip,
      userAgent: userAgent,
      lastActive: new Date()
    },
  });

  const accessToken = signAccessToken(userId, refreshTokenEntry.id);

  // Update Session Log with new token hash
  try {
    // Find session log with the OLD token hash
    // Since we don't have unique constraint on tokenHash in session log easily accessible or reliable 1:1,
    // we assume the scan is acceptable.
    // However, findFirst with tokenHash should work if we stored it correctly.
    // Note: 'match.tokenHash' is the BCRYPT hash. SessionLog stored this.
    const sessionLog = await prisma.sessionLog.findFirst({
      where: { sessionToken: match.tokenHash }
    });

    if (sessionLog) {
      await prisma.sessionLog.update({
        where: { id: sessionLog.id },
        data: {
          sessionToken: newTokenHash
        }
      });
    }
  } catch (logErr) {
    console.error('Failed to update session log on refresh:', logErr);
  }

  return { accessToken, refreshToken: newRefresh.raw, refreshExpiresAt: newRefresh.expiresAt };
}

export async function logout(refreshToken?: string) {
  if (!refreshToken) return;

  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { sub: string };
    const userId = decoded.sub;

    const candidates = await prisma.refreshToken.findMany({
      where: { userId },
      select: { id: true, tokenHash: true },
    });

    for (const c of candidates) {
      const ok = await verifyTokenHash(refreshToken, c.tokenHash);
      if (ok) {
        await prisma.refreshToken.delete({ where: { id: c.id } });

        // Close session log
        try {
          const sessionLog = await prisma.sessionLog.findFirst({
            where: { sessionToken: c.tokenHash }
          });
          if (sessionLog) {
            await prisma.sessionLog.update({
              where: { id: sessionLog.id },
              data: {
                isActive: false,
                logoutAt: new Date()
              }
            });
          }
        } catch (e) { console.error('Error closing session log:', e); }

        break;
      }
    }
  } catch {
    return;
  }
}

// ... existing helpers ...

export async function setupMfa(userId: string) {
  const secret = speakeasy.generateSecret({ length: 20, name: 'YarnManagement' });
  const url = await QRCode.toDataURL(secret.otpauth_url!);

  await recordAuditLog(AuditAction.MFA_DISABLED, { // Or call it MFA_SETUP_STARTED
    userId,
    metadata: { action: 'setup_initiated' }
  });

  return { secret: secret.base32, qrCode: url };
}

export async function enableMfa(userId: string, token: string, secret: string) {
  const verified = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
  });

  if (!verified) {
    const err: any = new Error('Invalid OTP code');
    err.status = 400;
    throw err;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { mfaEnabled: true, mfaSecret: secret },
  });

  await recordAuditLog(AuditAction.MFA_ENABLED, {
    userId,
    metadata: { method: 'TOTP' }
  });

  return true;
}

export async function validateMfa(userId: string, token: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.mfaSecret) return false;

  return speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: 'base32',
    token,
  });
}

export async function cleanupIdleSessions() {
  const idleThreshold = new Date(Date.now() - 8 * 60 * 1000); // 8 minutes ago

  try {
    const idleSessions = await prisma.refreshToken.findMany({
      where: {
        lastActive: { lt: idleThreshold }
      }
    });

    if (idleSessions.length > 0) {
      console.log(`Cleaning up ${idleSessions.length} idle sessions...`);

      // Delete refresh tokens
      await prisma.refreshToken.deleteMany({
        where: { id: { in: idleSessions.map(s => s.id) } }
      });

      // Update session logs
      await prisma.sessionLog.updateMany({
        where: {
          sessionToken: { in: idleSessions.map(s => s.tokenHash) },
          isActive: true
        },
        data: {
          isActive: false,
          logoutAt: new Date()
        }
      });
    }
  } catch (e) {
    console.error('Failed to cleanup idle sessions:', e);
  }
}
