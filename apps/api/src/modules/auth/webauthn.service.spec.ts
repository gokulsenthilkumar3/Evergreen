jest.mock('../../utils/user-audit', () => ({ appendUserAudit: (tx: any, args: any) => tx.activityLog.create(args) }));
jest.mock('@simplewebauthn/server', () => ({
  generateRegistrationOptions: jest.fn(async () => ({ challenge: 'registration-challenge' })),
  generateAuthenticationOptions: jest.fn(async () => ({ challenge: 'authentication-challenge' })),
  verifyRegistrationResponse: jest.fn(), verifyAuthenticationResponse: jest.fn(),
}));
import { BadRequestException } from '@nestjs/common';
import { generateRegistrationOptions, verifyAuthenticationResponse, verifyRegistrationResponse } from '@simplewebauthn/server';
import { WebAuthnService } from './webauthn.service';
describe('Passkey challenge boundaries', () => {
  const user = { id: 1, username: 'staff', status: 'ACTIVE', currentChallenge: '', credentials: [{ id: 'key', publicKey: Buffer.from('public'), counter: 0n, transports: '[]' }] };
  const tx = { user: { findUnique: jest.fn(), findUniqueOrThrow: jest.fn(), updateMany: jest.fn() }, webAuthnCredential: { create: jest.fn(), update: jest.fn() }, activityLog: { create: jest.fn() } };
  const prisma = { ...tx, $transaction: jest.fn(async (callback: any) => callback(tx)) };
  const service = new WebAuthnService(prisma as any, { get: () => undefined } as any);
  beforeEach(() => {
    jest.clearAllMocks(); user.currentChallenge = `AUTHENTICATE:${Date.now()}:challenge`;
    tx.user.findUnique.mockResolvedValue(user); tx.user.findUniqueOrThrow.mockResolvedValue(user); tx.user.updateMany.mockResolvedValue({ count: 1 });
    (verifyAuthenticationResponse as jest.Mock).mockResolvedValue({ verified: true, authenticationInfo: { newCounter: 1 } });
  });
  it('requires device user verification for registering a passkey', async () => {
    await service.getRegistrationOptions(1, 'staff');
    expect(generateRegistrationOptions).toHaveBeenCalledWith(expect.objectContaining({ authenticatorSelection: { residentKey: 'required', userVerification: 'required' } }));
    expect(tx.user.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: { currentChallenge: expect.stringMatching(/^REGISTER:\d+:registration-challenge$/) } }));
  });
  it('rejects an authentication challenge used for registration', async () => {
    await expect(service.verifyRegistration(1, {})).rejects.toBeInstanceOf(BadRequestException);
    expect(verifyRegistrationResponse).not.toHaveBeenCalled();
    expect(tx.webAuthnCredential.create).not.toHaveBeenCalled();
  });
  it('rejects expired challenges before validating an assertion', async () => {
    user.currentChallenge = `AUTHENTICATE:${Date.now() - 301000}:challenge`;
    await expect(service.verifyAuthentication('staff', { id: 'key' })).rejects.toBeInstanceOf(BadRequestException);
    expect(verifyAuthenticationResponse).not.toHaveBeenCalled();
  });
  it('rejects concurrent replay before updating a credential counter', async () => {
    tx.user.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.verifyAuthentication('staff', { id: 'key' })).rejects.toThrow('already used');
    expect(tx.webAuthnCredential.update).not.toHaveBeenCalled();
  });
  it('consumes the exact challenge and updates its counter inside one transaction', async () => {
    await expect(service.verifyAuthentication('staff', { id: 'key' })).resolves.toMatchObject({ verified: true });
    expect(tx.user.updateMany).toHaveBeenCalledWith({ where: { id: 1, status: 'ACTIVE', currentChallenge: user.currentChallenge }, data: { currentChallenge: null } });
    expect(tx.webAuthnCredential.update).toHaveBeenCalledWith({ where: { id: 'key' }, data: { counter: 1n } });
  });
});
