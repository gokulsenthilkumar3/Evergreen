import * as argon2 from 'argon2';
import * as bcrypt from 'bcrypt';
import { timingSafeEqual } from 'node:crypto';
import { BadRequestException } from '@nestjs/common';

export function validatePassword(password: string) {
  if (password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) throw new BadRequestException('Password must contain at least 12 characters and at most 72 UTF-8 bytes');
}
export async function hashPassword(password: string, enforcePolicy = true) {
  if (enforcePolicy) validatePassword(password);
  return argon2.hash(password, { type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 1 });
}
export async function verifyPassword(hash: string, password: string) {
  try {
    if (hash.startsWith('$argon2id$')) return await argon2.verify(hash, password);
    if (/^\$2[aby]\$/.test(hash)) return await bcrypt.compare(password, hash);
    if (hash.startsWith('$')) return false;
    // Retain the existing legacy-login migration; successful logins are upgraded.
    const expected = Buffer.from(hash), actual = Buffer.from(password);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch { return false; }
}
