import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SessionsService } from './sessions.service';

describe('SessionsService', () => {
  const prisma = {
    session: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  const service = new SessionsService(prisma as any);

  beforeEach(() => jest.clearAllMocks());

  it('limits non-admin session listings to the authenticated user', async () => {
    prisma.session.findMany.mockResolvedValue([]);
    await service.findSessionsForUser({ userId: 42, role: 'VIEWER' });
    expect(prisma.session.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 42 } }),
    );
  });

  it('allows admins to list all sessions', async () => {
    prisma.session.findMany.mockResolvedValue([]);
    await service.findSessionsForUser({ userId: 1, role: 'ADMIN' });
    expect(prisma.session.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined }),
    );
  });

  it('prevents a user from revoking another user session', async () => {
    prisma.session.findUnique.mockResolvedValue({ id: 'other', userId: 9 });
    await expect(
      service.revokeSession('other', { userId: 42, role: 'MODIFIER' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.session.update).not.toHaveBeenCalled();
  });

  it('allows an admin to revoke any existing session', async () => {
    prisma.session.findUnique.mockResolvedValue({ id: 'other', userId: 9 });
    prisma.session.update.mockResolvedValue({ id: 'other', isValid: false });
    await service.revokeSession('other', { userId: 1, role: 'ADMIN' });
    expect(prisma.session.update).toHaveBeenCalledWith({
      where: { id: 'other' },
      data: { isValid: false },
    });
  });

  it('returns not found for a missing session', async () => {
    prisma.session.findUnique.mockResolvedValue(null);
    await expect(
      service.revokeSession('missing', { userId: 1, role: 'ADMIN' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
