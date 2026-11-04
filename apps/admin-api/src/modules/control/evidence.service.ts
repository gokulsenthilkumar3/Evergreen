import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { hostname } from 'node:os';
import { verify } from 'node:crypto';
import { OWNER_PUBLIC_KEY } from '@evergreen/types/owner-public-key';
import { Prisma } from '@prisma/admin-client';
import { PrismaService } from '../../services/prisma.service';
import { jobProof } from './proof';

export function canonical(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object')
    return (
      '{' +
      Object.keys(value)
        .sort()
        .filter((k) => (value as any)[k] !== undefined)
        .map((k) => JSON.stringify(k) + ':' + canonical((value as any)[k]))
        .join(',') +
      '}'
    );
  return JSON.stringify(value) ?? 'null';
}
export const digest = (value: unknown) =>
  createHash('sha256').update(canonical(value)).digest('hex');
export function deriveEvidence(
  base: string,
  observation: any,
  expectedDigest?: string,
  now = Date.now(),
) {
  if (base === 'failed') return { state: 'failed' };
  if (
    !observation ||
    (expectedDigest && observation.entityDigest !== expectedDigest)
  )
    return { state: base };
  const evidence = {
    evidenceRef: observation.id,
    scope: observation.scope,
    source: observation.source,
    at: observation.observedAt,
    lastVerifiedAt: observation.observedAt,
    ttlSeconds: Number(observation.ttlSeconds),
  };
  if (!observation.ok) return { state: 'failed', ...evidence };
  const age = (now - Date.parse(observation.observedAt)) / 1000;
  if (!Number.isFinite(age) || age < -30) return { state: base };
  return {
    state:
      age > Math.max(60, Number(observation.ttlSeconds)) + 30
        ? 'stale'
        : 'verified',
    ...evidence,
  };
}
type LedgerRow = {
  seq: number;
  id: string;
  sourceKey: string;
  entityType: string;
  entityId: string;
  title: string;
  actor: string;
  action: string;
  state: string;
  evidenceRef: string | null;
  payloadDigest: string;
  hashPrev: string;
  hashCurr: string;
  at: string;
};
@Injectable()
export class EvidenceService implements OnModuleInit {
  private readonly limits = new Map<string, { count: number; until: number }>();
  private readonly instance = randomUUID();
  constructor(private readonly db: PrismaService) {}
  limit(actor: string, scope: string, maximum = 10) {
    const key = scope + ':' + actor,
      now = Date.now();
    let item = this.limits.get(key);
    if (!item || item.until <= now) {
      item = { count: 0, until: now + 60000 };
      this.limits.set(key, item);
    }
    if (++item.count > maximum)
      throw new HttpException(
        'Rate limit exceeded; retry after one minute',
        429,
      );
    if (this.limits.size > 10000)
      for (const [k, v] of this.limits)
        if (v.until < now) this.limits.delete(k);
  }
  async append(
    tx: any,
    event: {
      sourceKey: string;
      entityType: string;
      entityId: string;
      title: string;
      actor: string;
      action: string;
      state: string;
      evidenceRef?: string;
      payload?: unknown;
      at?: string;
    },
  ) {
    const existing =
      await tx.$queryRaw`SELECT id FROM AuditLedger WHERE sourceKey=${event.sourceKey}`;
    if (existing.length) return;
    const last =
      await tx.$queryRaw`SELECT hashCurr FROM AuditLedger ORDER BY seq DESC LIMIT 1`;
    const row = {
      id: randomUUID(),
      sourceKey: event.sourceKey,
      entityType: event.entityType,
      entityId: event.entityId,
      title: event.title,
      actor: event.actor,
      action: event.action,
      state: event.state,
      evidenceRef: event.evidenceRef || null,
      payloadDigest: digest(event.payload || {}),
      hashPrev: last[0]?.hashCurr || '',
      at: event.at || new Date().toISOString(),
    };
    const hashCurr = digest(row);
    await tx.$executeRaw`INSERT INTO AuditLedger(id,sourceKey,entityType,entityId,title,actor,action,state,evidenceRef,payloadDigest,hashPrev,hashCurr,at) VALUES(${row.id},${row.sourceKey},${row.entityType},${row.entityId},${row.title},${row.actor},${row.action},${row.state},${row.evidenceRef},${row.payloadDigest},${row.hashPrev},${hashCurr},${row.at})`;
  }
  async onModuleInit() {
    await this.importHistory();
  }
  async recordJob(job: any) {
    return this.db.$transaction((tx) =>
      this.append(tx, {
        sourceKey: 'job:' + job.id + ':' + job.updatedAt.toISOString(),
        entityType: 'RELEASE_JOB',
        entityId: job.id,
        title: job.target + ' · ' + job.version,
        actor: job.actor,
        action: job.status,
        state: jobProof(job).state,
        at: job.updatedAt.toISOString(),
        payload: { runId: job.runId, status: job.status },
      }),
    );
  }
  async importHistory() {
    // Import every persisted legacy audit; no artificial 250-entry ceiling.
    let skip = 0;
    for (;;) {
      const rows = await this.db.controlAudit.findMany({
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        skip,
        take: 200,
      });
      if (!rows.length) break;
      for (const row of rows) {
        let details: any = {};
        try {
          details = JSON.parse(row.details);
        } catch {}
        await this.db.$transaction((tx) =>
          this.append(tx, {
            sourceKey: 'audit:' + row.id,
            entityType: details.kind || 'AUDIT',
            entityId: row.recordId || row.id,
            title: details.title || row.action,
            actor: row.actor,
            action: row.action,
            state: 'recorded',
            payload: details,
            at: row.createdAt.toISOString(),
          }),
        );
      }
      skip += rows.length;
    }
    skip = 0;
    for (;;) {
      const jobs = await this.db.releaseJob.findMany({
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        skip,
        take: 200,
      });
      if (!jobs.length) break;
      for (const job of jobs)
        await this.db.$transaction((tx) =>
          this.append(tx, {
            sourceKey: 'job:' + job.id + ':' + job.updatedAt.toISOString(),
            entityType: 'RELEASE_JOB',
            entityId: job.id,
            title: job.target + ' · ' + job.version,
            actor: job.actor,
            action: job.status,
            state: jobProof(job).state,
            at: job.updatedAt.toISOString(),
            payload: { runId: job.runId, status: job.status },
          }),
        );
      skip += jobs.length;
    }
  }
  async ledger(query: {
    cursor?: string;
    limit?: string;
    entity?: string;
    from?: string;
    to?: string;
  }) {
    const cursor = query.cursor ? Number(query.cursor) : 2147483647,
      limit = query.limit ? Number(query.limit) : 50;
    if (
      !Number.isSafeInteger(cursor) ||
      cursor < 1 ||
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > 200
    )
      throw new BadRequestException('Invalid ledger cursor or limit');
    const entity = query.entity || '',
      from = query.from || '',
      to = query.to || '';
    if (
      (from && !Number.isFinite(Date.parse(from))) ||
      (to && !Number.isFinite(Date.parse(to)))
    )
      throw new BadRequestException('Invalid time filter');
    const rows = await this.db.$queryRaw<
      LedgerRow[]
    >`SELECT * FROM AuditLedger WHERE seq<${cursor} AND (${entity}='' OR entityId=${entity} OR entityType=${entity}) AND (${from}='' OR at>=${from}) AND (${to}='' OR at<=${to}) ORDER BY seq DESC LIMIT ${limit + 1}`;
    const page = rows.slice(0, limit);
    const refs = page
      .map((row) => row.evidenceRef)
      .filter((id): id is string => !!id);
    const observations = refs.length
      ? await this.db.$queryRaw<any[]>(
          Prisma.sql`SELECT * FROM EvidenceObservation WHERE id IN (${Prisma.join(refs)})`,
        )
      : [];
    return {
      events: page.map((row) => ({
        id: row.id,
        seq: Number(row.seq),
        entityId: row.entityId,
        entityType: row.entityType,
        title: row.title,
        actor: row.actor,
        action: row.action,
        at: row.at,
        hash: row.hashCurr,
        proof: {
          state: row.state,
          reason:
            'Immutable ledger event. Execution scope is stated separately.',
          source: 'provider.audit-ledger',
          at: row.at,
          ...(row.evidenceRef
            ? deriveEvidence(
                row.state,
                observations.find((o) => o.id === row.evidenceRef),
              )
            : {}),
          evidenceRef: row.evidenceRef,
        },
      })),
      hasMore: rows.length > limit,
      nextCursor:
        rows.length > limit ? String(page[page.length - 1].seq) : null,
      checkedAt: new Date().toISOString(),
      coverage:
        'Cursor-paginated append-only ledger. Imported legacy claims remain recorded; job events are observations, not reconstructed pre-existing history.',
    };
  }
  async verifyChain() {
    let cursor = 0,
      previous = '',
      checked = 0;
    for (;;) {
      const rows = await this.db.$queryRaw<
        LedgerRow[]
      >`SELECT * FROM AuditLedger WHERE seq>${cursor} ORDER BY seq ASC LIMIT 200`;
      if (!rows.length) break;
      for (const row of rows) {
        const { seq, hashCurr, ...fields } = row;
        if (row.hashPrev !== previous || digest(fields) !== hashCurr)
          return { ok: false, brokenAt: Number(seq), checked };
        previous = hashCurr;
        cursor = seq;
        checked++;
      }
    }
    return {
      ok: true,
      checked,
      head: previous,
      anchor:
        'Database-local hash chain. An external signed checkpoint is not configured; a privileged full rewrite is outside this guarantee.',
    };
  }
  async latest() {
    return this.db.$queryRaw<
      any[]
    >`SELECT e.* FROM EvidenceObservation e JOIN (SELECT entityType,entityId,MAX(seq) seq FROM EvidenceObservation GROUP BY entityType,entityId) x ON e.seq=x.seq`;
  }
  async decorate(rows: any[]) {
    const observations = await this.latest();
    return rows.map((row) => {
      const o = observations.find(
        (x) => x.entityType === 'CONTROL_RECORD' && x.entityId === row.id,
      );
      return {
        ...row,
        attestationDigest: digest({
          id: row.id,
          version: row.version,
          payload: row.payload,
        }),
        proof: {
          ...row.proof,
          ...deriveEvidence(
            'recorded',
            o,
            digest({ id: row.id, version: row.version, payload: row.payload }),
          ),
          reason: o?.scope || row.proof.reason,
        },
      };
    });
  }
  async observe(
    entityType: string,
    entityId: string,
    entityDigest: string,
    result: {
      ok: boolean;
      source: string;
      scope: string;
      latencyMs: number;
      statusCode: number | null;
    },
    actor: string,
    observationId = randomUUID(),
  ) {
    const observation = {
      id: observationId,
      entityType,
      entityId,
      entityDigest,
      ...result,
      observedAt: new Date().toISOString(),
      ttlSeconds: 60,
    };
    await this.db.$transaction(async (tx) => {
      await tx.$executeRaw`INSERT INTO EvidenceObservation(id,entityType,entityId,entityDigest,ok,source,scope,observedAt,ttlSeconds,latencyMs,statusCode) VALUES(${observation.id},${entityType},${entityId},${entityDigest},${result.ok},${result.source},${result.scope},${observation.observedAt},60,${result.latencyMs},${result.statusCode})`;
      await this.append(tx, {
        sourceKey: 'observation:' + observation.id,
        entityType,
        entityId,
        title: result.scope,
        actor,
        action: 'OBSERVED',
        state: result.ok ? 'executed' : 'failed',
        evidenceRef: observation.id,
        payload: observation,
      });
    });
    return {
      ...deriveEvidence('executed', observation),
      at: observation.observedAt,
      reason: result.scope,
    };
  }
  async probe(type: 'record' | 'company', id: string, actor: string) {
    this.limit(actor, 'probe', 20);
    const record =
      type === 'record'
        ? await this.db.controlRecord.findUnique({ where: { id } })
        : await this.db.company.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Entity not found');
    let config: any;
    try {
      config = JSON.parse(process.env.EVERGREEN_PROBE_TARGETS || '{}')[id];
    } catch {
      throw new BadRequestException('Invalid probe configuration');
    }
    if (!config?.url)
      return {
        proof: {
          state: 'recorded',
          reason: 'No operator-approved probe target configured',
          source: 'provider.configuration',
          at: new Date().toISOString(),
        },
        configured: false,
      };
    let url: URL;
    try {
      url = new URL(config.url);
      if (
        url.username ||
        url.password ||
        url.search ||
        url.hash ||
        !(
          url.protocol === 'https:' ||
          (url.protocol === 'http:' &&
            ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname))
        )
      )
        throw Error();
    } catch {
      throw new BadRequestException('Invalid operator-approved probe URL');
    }
    const start = performance.now();
    let ok = false,
      status: number | null = null;
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'error',
        signal: AbortSignal.timeout(2000),
      });
      status = response.status;
      ok = response.ok;
      await response.body?.cancel();
    } catch {}
    const entityDigest =
      type === 'record'
        ? digest({
            id: record.id,
            version: (record as any).version,
            payload: JSON.parse((record as any).payload),
          })
        : digest({ id: record.id });
    const proof = await this.observe(
      type === 'record' ? 'CONTROL_RECORD' : 'COMPANY',
      id,
      entityDigest,
      {
        ok,
        source: 'provider.http-probe',
        scope:
          'Endpoint reachability observed from provider; no business execution attested',
        latencyMs: Math.round(performance.now() - start),
        statusCode: status,
      },
      actor,
    );
    return { configured: true, ok, statusCode: status, proof };
  }
  async health() {
    const started = performance.now();
    await this.db.$queryRaw`SELECT 1`;
    const databases = await this.db.$queryRaw<any[]>`PRAGMA database_list`;
    const location = databases.find((x) => x.name === 'main')?.file || 'memory';
    return {
      host: hostname(),
      instance: this.instance,
      dbPath: location,
      dbFingerprint: digest(location).slice(0, 16),
      latencyMs: Math.round(performance.now() - started),
      checkedAt: new Date().toISOString(),
    };
  }
  async search(query: string) {
    const q = (query || '').trim();
    if (q.length < 2 || q.length > 120)
      return { results: [], at: new Date().toISOString() };
    const [companies, records, jobs] = await Promise.all([
      this.db.company.findMany({
        where: { OR: [{ name: { contains: q } }, { id: { contains: q } }] },
        select: { id: true, name: true },
        take: 10,
      }),
      this.db.controlRecord.findMany({
        where: { OR: [{ title: { contains: q } }, { id: { contains: q } }] },
        select: { id: true, title: true, kind: true },
        take: 15,
      }),
      this.db.releaseJob.findMany({
        where: { OR: [{ version: { contains: q } }, { id: { contains: q } }] },
        select: { id: true, version: true, target: true },
        take: 5,
      }),
    ]);
    return {
      results: [
        ...companies.map((c) => ({ id: c.id, label: c.name, type: 'COMPANY' })),
        ...records.map((r) => ({ id: r.id, label: r.title, type: r.kind })),
        ...jobs.map((j) => ({
          id: j.id,
          label: j.target + ' ' + j.version,
          type: 'RELEASE_JOB',
        })),
      ],
      at: new Date().toISOString(),
    };
  }
  async request(kind: string, entityId: string, body: any, actor: string) {
    const allowed = [
      'WEBHOOK_REPLAY',
      'ROLLBACK',
      'BACKUP',
      'RESTORE_DRILL',
      'PROVISION_REGION',
      'PROVISION_ENGINE',
      'PROVISION_SECRETS',
      'PROVISION_DNS',
      'PROVISION_SMOKE',
      'PROVISION_ATTEST',
    ];
    if (!allowed.includes(kind))
      throw new BadRequestException('Unsupported operation');
    if (
      !body ||
      typeof body.requestKey !== 'string' ||
      !/^[a-f0-9-]{36}$/i.test(body.requestKey)
    )
      throw new BadRequestException('A UUID request key is required');
    this.limit(actor, 'request', 20);
    const payload = {
      note: typeof body.note === 'string' ? body.note.slice(0, 1000) : '',
      step: kind.startsWith('PROVISION_') ? kind.slice(10) : undefined,
    };
    if (kind === 'WEBHOOK_REPLAY') {
      const r = await this.db.controlRecord.findUnique({
        where: { id: entityId },
      });
      if (r?.kind !== 'WEBHOOK')
        throw new NotFoundException('Webhook configuration not found');
    }
    if (
      kind === 'ROLLBACK' &&
      !(await this.db.releaseJob.findUnique({ where: { id: entityId } }))
    )
      throw new NotFoundException('Release job not found');
    return this.db.$transaction(async (tx) => {
      const existing = await tx.$queryRaw<
        any[]
      >`SELECT * FROM OperationRequest WHERE requestKey=${body.requestKey}`;
      if (existing.length) {
        if (
          existing[0].kind !== kind ||
          existing[0].entityId !== entityId ||
          existing[0].payload !== canonical(payload)
        )
          throw new ConflictException('Request key already used');
        return existing[0];
      }
      const id = randomUUID(),
        at = new Date().toISOString(),
        json = canonical(payload);
      await tx.$executeRaw`INSERT INTO OperationRequest(id,requestKey,kind,entityId,actor,payload,state,at) VALUES(${id},${body.requestKey},${kind},${entityId},${actor},${json},'requested',${at})`;
      await this.append(tx, {
        sourceKey: 'request:' + id,
        entityType: 'OPERATION_REQUEST',
        entityId: id,
        title: kind + ' · ' + entityId,
        actor,
        action: kind,
        state: 'requested',
        payload: { entityId, ...payload },
        at,
      });
      return {
        id,
        kind,
        entityId,
        state: 'requested',
        at,
        executor: 'No executor acknowledgement; no external action is assumed.',
      };
    });
  }
  async requests() {
    return this.db.$queryRaw<
      any[]
    >`SELECT id,kind,entityId,state,actor,at FROM OperationRequest ORDER BY at DESC LIMIT 100`;
  }
  async attest(id: string, body: any, actor: string) {
    this.limit(actor, 'attest', 10);
    const row = await this.db.controlRecord.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Record not found');
    const expected = digest({
      id: row.id,
      version: row.version,
      payload: JSON.parse(row.payload),
    });
    const p = body?.payload,
      now = Date.now();
    if (
      !p ||
      p.entityId !== id ||
      p.entityDigest !== expected ||
      p.scope !== 'OPERATOR_APPROVAL' ||
      !Number.isSafeInteger(p.issuedAt) ||
      !Number.isSafeInteger(p.expiresAt) ||
      p.issuedAt > now + 30000 ||
      p.issuedAt < now - 300000 ||
      p.expiresAt < now ||
      p.expiresAt - p.issuedAt > 300000 ||
      typeof p.nonce !== 'string' ||
      !/^[a-f0-9-]{36}$/i.test(p.nonce) ||
      typeof body.signature !== 'string' ||
      body.signature.length > 128
    )
      throw new BadRequestException('Invalid or expired owner approval');
    if (
      !verify(
        null,
        Buffer.from(canonical(p)),
        OWNER_PUBLIC_KEY,
        Buffer.from(body.signature, 'base64url'),
      )
    )
      throw new BadRequestException('Owner signature was not accepted');
    const seen = await this.db.$queryRaw<
      any[]
    >`SELECT id FROM EvidenceObservation WHERE id=${p.nonce}`;
    if (seen.length) throw new ConflictException('Approval already recorded');
    return {
      proof: await this.observe(
        'CONTROL_RECORD',
        id,
        expected,
        {
          ok: true,
          source: 'owner.ed25519-signature',
          scope: 'Owner signed approval only; not external execution',
          latencyMs: 0,
          statusCode: null,
        },
        actor,
        p.nonce,
      ),
    };
  }
  async evidence(id: string) {
    const rows = await this.db.$queryRaw<
      any[]
    >`SELECT * FROM EvidenceObservation WHERE id=${id}`;
    if (!rows.length) throw new NotFoundException('Evidence not found');
    return { ...rows[0], seq: Number(rows[0].seq) };
  }
}
