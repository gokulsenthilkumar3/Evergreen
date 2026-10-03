import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../services/prisma.service';
import { EmailService } from './email.service';
import type { User } from '@prisma/client';

const verify = jest.fn();
jest.mock('otplib', () => ({
  TOTP: jest
    .fn()
    .mockImplementation(() => ({
      verify: (...args: unknown[]) => verify(...args),
    })),
  generateURI: jest.fn(),
}));
import { AuthService } from './auth.service';

describe('MFA verification', () => {
  const user = {
    id: 1,
    username: 'staff',
    isTotpEnabled: true,
    totpSecret: 'SECRET',
  } as Omit<User, 'password'>;
  const prisma = {
    session: { create: jest.fn() },
    user: { findUnique: jest.fn(), update: jest.fn() },
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
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { isTotpEnabled: true },
    });
  });
});
