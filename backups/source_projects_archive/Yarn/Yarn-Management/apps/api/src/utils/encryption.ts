import crypto from 'crypto';
import { env } from '../config/env';

const ALGORITHM = 'aes-256-cbc';
const KEY = env.ENCRYPTION_SECRET;
const IV_LENGTH = 16;

/**
 * Encrypts a string using AES-256-CBC
 * Returns the IV and Ciphertext combined as a colon-separated hex string
 */
export function encrypt(text: string): string {
    if (!text) return text;

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY), iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a string encrypted with the above function
 */
export function decrypt(text: string): string {
    if (!text || !text.includes(':')) return text;

    try {
        const [ivHex, encryptedHex] = text.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(KEY), iv);

        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error);
        return text; // Fallback to original text if decryption fails
    }
}
