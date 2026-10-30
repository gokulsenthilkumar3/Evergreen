import { decryptField, encryptField } from './crypto';

describe('field encryption', () => {
  const original = process.env.ENCRYPTION_SECRET;
  afterEach(() => {
    if (original === undefined) delete process.env.ENCRYPTION_SECRET;
    else process.env.ENCRYPTION_SECRET = original;
  });

  it('refuses to encrypt without an installation secret instead of using a built-in key', () => {
    delete process.env.ENCRYPTION_SECRET;
    expect(() => encryptField('33ABCDE1234F1Z5')).toThrow(/ENCRYPTION_SECRET/);
    expect(() => decryptField('AAAA')).toThrow(/ENCRYPTION_SECRET/);
  });

  it('rejects a short secret', () => {
    expect(() => encryptField('value', 'too-short')).toThrow(/32 characters/);
  });

  it('round-trips with the configured secret and fails with another one', () => {
    process.env.ENCRYPTION_SECRET = 'a'.repeat(40);
    const sealed = encryptField('33ABCDE1234F1Z5');
    expect(sealed).not.toContain('33ABCDE1234F1Z5');
    expect(decryptField(sealed)).toBe('33ABCDE1234F1Z5');
    expect(() => decryptField(sealed, 'b'.repeat(40))).toThrow();
  });
});
