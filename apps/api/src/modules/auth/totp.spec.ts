import { authenticator } from './totp';

describe('real authenticator integration', () => {
  it('generates independent Base32 secrets and verifies codes without mocking the OTP library', async () => {
    const secret = authenticator.generateSecret();
    expect(secret).toMatch(/^[A-Z2-7]+$/);
    expect(authenticator.generateSecret()).not.toBe(secret);
    const epoch = 1_793_793_600;
    const code = await authenticator.generate({ secret, epoch });
    expect(code).toMatch(/^\d{6}$/);
    await expect(authenticator.verify(code, { secret, epoch })).resolves.toMatchObject({ valid: true });
    const incorrect = String((Number(code) + 1) % 1_000_000).padStart(6, '0');
    await expect(authenticator.verify(incorrect, { secret, epoch })).resolves.toMatchObject({ valid: false });
    await expect(authenticator.verify(code, { secret, epoch: epoch + 90 })).resolves.toMatchObject({ valid: false });
  });
});
