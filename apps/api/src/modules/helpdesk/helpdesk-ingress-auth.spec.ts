import { createHash, createHmac } from 'node:crypto';
import {
  canonicalSupportPayload,
  verifySupportIngress,
} from './helpdesk-ingress-auth';
describe('Signed helpdesk ingress', () => {
  const secret = 'a-test-secret-with-more-than-32-characters',
    timestamp = String(Date.now()),
    nonce = 'a_unique_test_nonce_123';
  const body = {
    externalId: 'alert-1',
    subject: 'Monitoring issue',
    description: 'External monitoring reported an error',
    category: 'BUG',
    priority: 'HIGH',
  };
  const signature = (
    source: string,
    payload: unknown = body,
    time = timestamp,
  ) =>
    createHmac('sha256', secret)
      .update(
        `v1\n${source}\n${time}\n${nonce}\n${createHash('sha256').update(canonicalSupportPayload(payload)).digest('hex')}`,
      )
      .digest('hex');
  const prior = process.env.HELPDESK_INGRESS_MONITOR_SECRET;
  beforeEach(() => {
    process.env.HELPDESK_INGRESS_MONITOR_SECRET = secret;
  });
  afterAll(() => {
    if (prior) process.env.HELPDESK_INGRESS_MONITOR_SECRET = prior;
    else delete process.env.HELPDESK_INGRESS_MONITOR_SECRET;
  });
  it('accepts the configured source signature and rejects changed content', () => {
    expect(
      verifySupportIngress(
        'MONITOR',
        body,
        timestamp,
        nonce,
        signature('MONITOR'),
      ),
    ).toHaveLength(64);
    expect(() =>
      verifySupportIngress(
        'MONITOR',
        { ...body, priority: 'URGENT' },
        timestamp,
        nonce,
        signature('MONITOR'),
      ),
    ).toThrow('authentication failed');
  });
  it('rejects missing configuration, source substitution and expired messages', () => {
    expect(() =>
      verifySupportIngress(
        'EMAIL',
        body,
        timestamp,
        nonce,
        signature('MONITOR'),
      ),
    ).toThrow();
    const stale = String(Date.now() - 600000);
    expect(() =>
      verifySupportIngress(
        'MONITOR',
        body,
        stale,
        nonce,
        signature('MONITOR', body, stale),
      ),
    ).toThrow();
  });
  it('uses stable sorted canonical JSON and omits undefined DTO fields', () => {
    expect(canonicalSupportPayload({ b: 2, a: 1, missing: undefined })).toBe(
      '{"a":1,"b":2}',
    );
  });
});
