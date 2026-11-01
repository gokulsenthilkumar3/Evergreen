jest.mock('../../utils/user-audit',()=>({appendUserAudit:(tx:any,args:any)=>tx.activityLog.create(args)}));
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../services/prisma.service';
import { EmailService } from './email.service';
import type { User } from '@prisma/client';

const verify = jest.fn();
jest.mock('otplib', () => ({
  TOTP: jest.fn().mockImplementation(() => ({
    verify: (...args: unknown[]) => verify(...args),
  })),
  generateURI: jest.fn(),
}));
import { AuthService } from './auth.service';

describe('MFA verification', () => {
  const user = {
    id: 1,
    username: 'staff',
    status: 'ACTIVE',
    isTotpEnabled: true,
    totpSecret: 'SECRET',
  } as Omit<User, 'password'>;
  const prisma = {
    $transaction: jest.fn(async (callback: any): Promise<any> => callback(prisma)),
    activityLog: { create: jest.fn() },
    session: { create: jest.fn(), updateMany: jest.fn() },
    user: { findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
  };
  const service = new AuthService(
    {} as JwtService,
    prisma as unknown as PrismaService,
    {} as EmailService,
    {} as ConfigService,
  );
  beforeEach(() => {
    jest.clearAllMocks();
    verify.mockResolvedValue({ valid: false });
    prisma.user.findUnique.mockResolvedValue(user);
    prisma.user.update.mockResolvedValue({ failedLogins: 1 });
    prisma.user.updateMany.mockResolvedValue({ count: 1 });
  });
  it('rejects an invalid code without creating a session', async () => {
    await expect(
      service.login(user, undefined, '123456'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.session.create).not.toHaveBeenCalled();
  });
  it('does not enable MFA for an invalid code', async () => {
    await expect(
      service.verifyAndEnableTotp(1, '123456'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
  it('enables MFA after a valid verification result', async () => {
    verify.mockResolvedValue({ valid: true });
    await expect(service.verifyAndEnableTotp(1, '123456')).resolves.toEqual({
      success: true,
    });
    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { id: 1, status: 'ACTIVE', totpSecret: 'SECRET', isTotpEnabled: false },
      data: { isTotpEnabled: true },
    });
  });
});

describe('password change', () => {
  it('signs out every other session in the same transaction and keeps the current one', async () => {
    const bcrypt = await import('bcrypt');
    const prisma = {
      user: {
        findUnique: jest.fn(async () => ({
          id: 7,
          status: 'ACTIVE',
          password: await bcrypt.hash('Old-Password-123', 4),
        })),
        updateMany: jest.fn(async () => ({ count: 1 })),
      },
      session: { updateMany: jest.fn(async () => ({ count: 2 })) },
      activityLog: { create: jest.fn() },
      $transaction: jest.fn(async (callback: any): Promise<any> => callback(prisma)),
    };
    const service = new AuthService(
      {} as JwtService,
      prisma as unknown as PrismaService,
      {} as EmailService,
      {} as ConfigService,
    );
    const result = await service.changePassword(
      7,
      'staff',
      { currentPassword: 'Old-Password-123', newPassword: 'New-Password-456' },
      'current-session',
    );
    expect(prisma.session.updateMany).toHaveBeenCalledWith({
      where: { userId: 7, isValid: true, id: { not: 'current-session' } },
      data: { isValid: false },
    });
    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function));
    expect(result).toMatchObject({ success: true, signedOutSessions: 2 });
  });
});
