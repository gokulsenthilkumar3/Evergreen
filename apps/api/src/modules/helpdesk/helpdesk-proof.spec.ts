import {
  checkTicketChain,
  deriveHelpdeskProof,
  ticketEventHash,
  TICKET_AUDIT_ROOT,
} from './helpdesk-proof';
describe('Helpdesk proof derivation', () => {
  const row = {
    id: 'event',
    ticketId: 'ticket',
    version: 1,
    requestKey: null,
    actorId: 1,
    actorPublicId: 'user',
    actorUsername: 'alice',
    kind: 'CLOSED',
    visibility: 'PUBLIC',
    payload: '{}',
    previousHash: TICKET_AUDIT_ROOT,
    createdAt: new Date('2026-01-01T00:00:00Z'),
  };
  const event = { ...row, hash: ticketEventHash(row) };
  it('never turns a local integrity check alone into resolution verification', () => {
    expect(
      deriveHelpdeskProof(
        { status: 'RESOLVED', confirmedAt: null, closedAt: null },
        [event],
        true,
      ),
    ).toBe('requested');
    expect(
      deriveHelpdeskProof(
        { status: 'RESOLVED', confirmedAt: new Date(), closedAt: null },
        [event],
        true,
      ),
    ).toBe('requested');
  });
  it('derives stale from an audited closure after 14 days without confirmation', () => {
    expect(
      deriveHelpdeskProof(
        { status: 'CLOSED', confirmedAt: null, closedAt: row.createdAt },
        [event],
        true,
        new Date('2026-01-16T00:00:00Z'),
      ),
    ).toBe('stale');
    expect(
      deriveHelpdeskProof(
        { status: 'CLOSED', confirmedAt: null, closedAt: row.createdAt },
        [event],
        false,
        new Date('2026-01-16T00:00:00Z'),
      ),
    ).toBe('recorded');
  });
  it('detects changed event payloads and missing terminal events', () => {
    expect(checkTicketChain([event], 1)).toMatchObject({
      valid: true,
      complete: true,
    });
    expect(checkTicketChain([{ ...event, payload: 'tampered' }], 1).valid).toBe(
      false,
    );
    expect(checkTicketChain([event], 2).valid).toBe(false);
  });
});
