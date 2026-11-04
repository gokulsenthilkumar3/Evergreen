import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('session activity write coalescing', () => {
  const now = new Date('2026-11-04T10:00:00Z');
  let prisma: any;
  let strategy: JwtStrategy;
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now);
    prisma = {
      session: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'session', userId: 1, isValid: true,
          createdAt: new Date(now.getTime() - 3_600_000),
          lastActive: new Date(now.getTime() - 10_000), lastSeenAt: null,
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      user: { findUnique: jest.fn().mockResolvedValue({ id: 1, username: 'staff', role: 'ADMIN', status: 'ACTIVE' }) },
      userSessionPolicy: { findUnique: jest.fn().mockResolvedValue({ absoluteMinutes: 1440, idleMinutes: 0 }) },
    };
    strategy = new JwtStrategy(prisma, new ConfigService({ JWT_SECRET: 'fixture-only-secret-with-more-than-32-characters' }));
  });
  afterEach(() => jest.useRealTimers());
  it('keeps checking revocation and staff status while avoiding frequent writes', async () => {
    await strategy.validate({ sessionId: 'session', sub: 1 });
    await strategy.validate({ sessionId: 'session', sub: 1 });
    expect(prisma.session.findUnique).toHaveBeenCalledTimes(2);
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(2);
    expect(prisma.session.updateMany).not.toHaveBeenCalled();
  });
  it('conditionally updates stale activity, allowing the database to coalesce concurrent requests', async () => {
    const session = await prisma.session.findUnique();
    session.lastActive = new Date(now.getTime() - 61_000);
    await strategy.validate({ sessionId: 'session', sub: 1 });
    expect(prisma.session.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: 'session', isValid: true, OR: expect.any(Array) }),
      data: { lastActive: now, lastSeenAt: now },
    }));
  });
  it('touches within short idle windows and rejects expired/revoked sessions', async () => {
    const session = await prisma.session.findUnique();
    session.lastActive = new Date(now.getTime() - 20_000);
    prisma.userSessionPolicy.findUnique.mockResolvedValue({ absoluteMinutes: 1440, idleMinutes: 1 });
    await strategy.validate({ sessionId: 'session', sub: 1 });
    expect(prisma.session.updateMany).toHaveBeenCalledTimes(1);
    session.lastActive = new Date(now.getTime() - 61_000);
    await expect(strategy.validate({ sessionId: 'session', sub: 1 })).rejects.toThrow('expired');
    session.isValid = false;
    await expect(strategy.validate({ sessionId: 'session', sub: 1 })).rejects.toThrow('revoked');
  });
});
