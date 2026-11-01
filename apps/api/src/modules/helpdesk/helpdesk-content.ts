/** Best-effort secret removal; never claim arbitrary text is free of sensitive data. */
export function supportText(value: string) {
  return value
    .replace(
      /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
      '[REDACTED PRIVATE KEY]',
    )
    .replace(/\bBearer\s+[A-Za-z0-9._~+\/-]{12,}={0,2}/gi, 'Bearer [REDACTED]')
    .replace(
      /\b(?:sk-[A-Za-z0-9_-]{16,}|gh[pousr]_[A-Za-z0-9]{20,}|AIza[A-Za-z0-9_-]{30,})\b/g,
      '[REDACTED TOKEN]',
    )
    .replace(
      /((?:password|app[_ -]?password|client[_ -]?secret|api[_ -]?key|recovery[_ -]?code)\s*[:=]\s*)["']?(?!YOUR_|EXAMPLE|REPLACE|\[REDACTED)[^\s"'<>]{6,}["']?/gi,
      '$1[REDACTED]',
    );
}
export function redactSupportPii(value: unknown): unknown {
  if (typeof value === 'string')
    return supportText(value)
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED EMAIL]')
      .replace(
        /(?<!\w)(?:\+\d{1,3}[ -]?)?\d{3}[ -]\d{3}[ -]\d{4}(?!\w)/g,
        '[REDACTED PHONE]',
      );
  if (Array.isArray(value)) return value.map(redactSupportPii);
  if (value && typeof value === 'object') {
    if (value instanceof Date) return value;
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        ['actorUsername', 'createdBy'].includes(key)
          ? '[REDACTED ACTOR]'
          : redactSupportPii(entry),
      ]),
    );
  }
  return value;
}
