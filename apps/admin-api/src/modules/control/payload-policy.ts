export const PAYLOAD_FIELDS = [
  'description',
  'channel',
  'message',
  'provider',
  'region',
  'engine',
  'environment',
  'endpoint',
  'events',
  'amountPaise',
  'currency',
  'reference',
  'legalEntity',
  'evidenceUrl',
  'children',
] as const;
export function projectedPayload(value: unknown): Record<string, unknown> {
  const input =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  return Object.fromEntries(
    PAYLOAD_FIELDS.filter((key) => key in input).map((key) => {
      let v = input[key];
      if (key === 'children')
        v = Array.isArray(v)
          ? v
              .slice(0, 50)
              .map((child) =>
                Object.fromEntries(
                  ['id', 'title', 'status']
                    .filter((k) => typeof child?.[k] === 'string')
                    .map((k) => [k, child[k].slice(0, 1000)]),
                ),
              )
          : [];
      else if (typeof v === 'string') {
        v = v.slice(0, 4000);
        if (key === 'endpoint' || key === 'evidenceUrl') {
          try {
            const url = new URL(v as string);
            url.username = '';
            url.password = '';
            url.search = '';
            url.hash = '';
            v = ['https:', 'http:'].includes(url.protocol)
              ? url.toString()
              : '[redacted URL]';
          } catch {
            v = '[redacted URL]';
          }
        }
      } else if (typeof v !== 'number' && typeof v !== 'boolean')
        v = '[redacted non-scalar]';
      return [key, v];
    }),
  );
}
