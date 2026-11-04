import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
export const INGRESS_SOURCES = [
  'MONITOR',
  'DEPLOYMENT',
  'WEBHOOK',
  'HEARTBEAT',
  'CHATOPS',
  'EMAIL',
] as const;
export const HELP_DESK_INTEGRATION_ACTOR = Symbol(
  'authenticated-helpdesk-integration',
);
export function canonicalSupportPayload(value: unknown): string {
  if (Array.isArray(value))
    return '[' + value.map(canonicalSupportPayload).join(',') + ']';
  if (value && typeof value === 'object')
    return (
      '{' +
      Object.keys(value)
        .filter((key) => (value as Record<string, unknown>)[key] !== undefined)
        .sort()
        .map(
          (key) =>
            JSON.stringify(key) +
            ':' +
            canonicalSupportPayload((value as Record<string, unknown>)[key]),
        )
        .join(',') +
      '}'
    );
  return JSON.stringify(value);
}
export function verifySupportIngress(
  source: string,
  body: unknown,
  timestamp: string,
  nonce: string,
  signature: string,
  now = Date.now(),
) {
  if (!(INGRESS_SOURCES as readonly string[]).includes(source))
    throw new BadRequestException('Unknown support integration source');
  const secret = process.env[`HELPDESK_INGRESS_${source}_SECRET`];
  if (
    !secret ||
    secret.length < 32 ||
    !/^\d{13}$/.test(timestamp) ||
    Math.abs(now - Number(timestamp)) > 300000 ||
    !/^[a-zA-Z0-9_-]{16,100}$/.test(nonce) ||
    !/^[a-f0-9]{64}$/i.test(signature)
  )
    throw new UnauthorizedException(
      'Support integration authentication failed',
    );
  const digest = createHash('sha256')
      .update(canonicalSupportPayload(body))
      .digest('hex'),
    expected = createHmac('sha256', secret)
      .update(`v1\n${source}\n${timestamp}\n${nonce}\n${digest}`)
      .digest();
  if (!timingSafeEqual(expected, Buffer.from(signature, 'hex')))
    throw new UnauthorizedException(
      'Support integration authentication failed',
    );
  return digest;
}
