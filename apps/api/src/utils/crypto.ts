import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 16; // 128 bits
const SALT = 'evergreen_spinning_field_encryption_salt_2026';

/** Each installation supplies its own secret; a committed default would let anyone decrypt. */
function getKey(masterSecret?: string): Buffer {
  const secret = masterSecret || process.env.ENCRYPTION_SECRET;
  if (!secret || secret.length < 32)
    throw new Error(
      'ENCRYPTION_SECRET must be set to at least 32 characters before encrypting or decrypting fields',
    );
  return scryptSync(secret, SALT, 32);
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Output format: base64(iv + ciphertext + authTag)
 */
export function encryptField(plaintext: string, masterSecret?: string): string {
  if (!plaintext) return '';
  const key = getKey(masterSecret);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, encrypted, tag]).toString('base64');
}

/**
 * Decrypt an AES-256-GCM ciphertext string.
 */
export function decryptField(
  encryptedPayload: string,
  masterSecret?: string,
): string {
  if (!encryptedPayload) return '';
  const key = getKey(masterSecret);
  const buffer = Buffer.from(encryptedPayload, 'base64');

  if (buffer.length < IV_LENGTH + TAG_LENGTH) {
    throw new Error('Invalid ciphertext length for AES-256-GCM payload');
  }

  const iv = buffer.subarray(0, IV_LENGTH);
  const tag = buffer.subarray(buffer.length - TAG_LENGTH);
  const ciphertext = buffer.subarray(IV_LENGTH, buffer.length - TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString('utf8');
}
