import { createHash } from 'node:crypto';
export const TICKET_AUDIT_ROOT = '0'.repeat(64);
export interface TicketEventHashInput {
  id: string;
  ticketId: string;
  version: number;
  requestKey: string | null;
  actorId: number;
  actorPublicId: string | null;
  actorUsername: string;
  kind: string;
  visibility: string;
  payload: string;
  previousHash: string;
  createdAt: Date;
}
export function ticketEventHash(row: TicketEventHashInput) {
  return createHash('sha256')
    .update(
      JSON.stringify({
        v: 1,
        id: row.id,
        ticketId: row.ticketId,
        version: row.version,
        requestKey: row.requestKey,
        actorId: row.actorId,
        actorPublicId: row.actorPublicId,
        actorUsername: row.actorUsername,
        kind: row.kind,
        visibility: row.visibility,
        payload: row.payload,
        previousHash: row.previousHash,
        createdAt: row.createdAt.toISOString(),
      }),
    )
    .digest('hex');
}
/** A local chain check is integrity evidence, never an external signature. */
export function checkTicketChain(
  events: (TicketEventHashInput & { hash: string })[],
  currentVersion: number,
) {
  let previous = TICKET_AUDIT_ROOT;
  let version = events[0]?.version ?? 0;
  for (const event of events) {
    if (
      event.previousHash !== previous ||
      event.version !== version ||
      ticketEventHash(event) !== event.hash
    )
      return { valid: false, complete: false, events: events.length };
    previous = event.hash;
    version++;
  }
  const valid =
    events.length > 0 && events[events.length - 1].version === currentVersion;
  return {
    valid,
    complete: valid && events[0].version === 1,
    events: events.length,
  };
}
export function deriveHelpdeskProof(
  ticket: { status: string; confirmedAt: Date | null; closedAt: Date | null },
  events: (TicketEventHashInput & { hash: string })[],
  integrity: boolean,
  now = new Date(),
) {
  if (!integrity) return 'recorded';
  const lastOutcome = [...events]
    .reverse()
    .find((event) =>
      ['RESOLVED', 'REOPENED', 'CONFIRMED_FIXED', 'REJECTED_FIX','AUTO_CLOSED'].includes(
        event.kind,
      ),
    );
  if (
    lastOutcome?.kind === 'CONFIRMED_FIXED' &&
    ticket.confirmedAt &&
    ['RESOLVED', 'CLOSED'].includes(ticket.status)
  )
    return 'verified';
  if (lastOutcome?.kind === 'REJECTED_FIX') return 'failed';
  if(lastOutcome?.kind==='AUTO_CLOSED'&&ticket.status==='CLOSED')return 'stale';
  if (
    ticket.status === 'CLOSED' &&
    ticket.closedAt &&
    now.getTime() - ticket.closedAt.getTime() >= 14 * 86400000
  )
    return 'stale';
  if (['RESOLVED', 'CLOSED'].includes(ticket.status)) return 'requested';
  return 'recorded';
}
