import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { Prisma } from '@prisma/admin-client';
export const STATES: Record<string, string[]> = {
 TASK: ['OPEN','IN_PROGRESS','BLOCKED','DONE'], MAINTENANCE: ['SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED'],
 DATABASE: ['REQUESTED','IN_PROGRESS','COMPLETED','FAILED'], API: ['DRAFT','ACTIVE','DISABLED'],
 WEBHOOK: ['DRAFT','CONFIGURED','DISABLED'], INTEGRATION: ['NOT_CONFIGURED','CONFIGURED','DISABLED'],
 PAYMENT: ['PENDING','VERIFIED','DISPUTED','REFUNDED'], AGREEMENT: ['DRAFT','IN_REVIEW','SIGNED','EXPIRED'],
 INCIDENT: ['OPEN','INVESTIGATING','MONITORING','RESOLVED'], RUNBOOK: ['DRAFT','REVIEWED','ARCHIVED'],
 CHAT: ['POSTED'], AGENT: ['DRAFT','CONFIGURED','PAUSED'], RELEASE: ['DRAFT','BUILDING','READY','FAILED'],
 DEPLOYMENT: ['QUEUED','RUNNING','SUCCEEDED','FAILED','CANCELLED'], INQUIRY: ['NEW','CONTACTED','QUALIFIED','CLOSED'], DASHBOARD: ['SAVED'],
};
@Injectable()
export class ControlService {
 constructor(private readonly prisma: PrismaService) {}
 private view(row: any) { return { ...row, payload: JSON.parse(row.payload) }; }
 async list(kind?: string) {
  if (kind && !Object.hasOwn(STATES, kind)) throw new BadRequestException('Unknown record type');
  return (await this.prisma.controlRecord.findMany({ where: kind ? { kind } : {}, orderBy: { updatedAt:'desc' }, take:1000 })).map((r: any) => this.view(r));
 }
 audit() { return this.prisma.controlAudit.findMany({ orderBy:{ createdAt:'desc' }, take:250 }); }
 validate(body: any, kind: string) {
  if (!Object.hasOwn(STATES, kind)) throw new BadRequestException('Unknown record type');
  if (typeof body.title !== 'string' || !body.title.trim() || body.title.length > 200) throw new BadRequestException('Enter a title of 1–200 characters');
  const status = body.status || STATES[kind][0];
  if (!STATES[kind].includes(status)) throw new BadRequestException('Invalid status');
  if (body.priority && !['LOW','NORMAL','HIGH','URGENT'].includes(body.priority)) throw new BadRequestException('Invalid priority');
  if (body.owner && (typeof body.owner !== 'string' || body.owner.length > 120)) throw new BadRequestException('Invalid owner');
  if (body.companyId && typeof body.companyId !== 'string') throw new BadRequestException('Invalid company');
  if (body.dueAt && !Number.isFinite(new Date(body.dueAt).getTime())) throw new BadRequestException('Invalid date');
  const payload = body.payload ?? {};
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new BadRequestException('Invalid record details');
  const json = JSON.stringify(payload);
  if (json.length > 24000) throw new BadRequestException('Record details exceed 24 KB');
  if (/"(?:password|apiKey|accessToken|secret|privateKey)"\s*:/i.test(json)) throw new BadRequestException('Use a secret reference, never a credential');
  if (kind === 'PAYMENT' && (!Number.isSafeInteger(payload.amountPaise) || payload.amountPaise <= 0)) throw new BadRequestException('Enter a positive amount in paise');
  if (kind === 'PAYMENT' && status === 'VERIFIED' && !payload.reference) throw new BadRequestException('A payment reference is required');
  if (kind === 'AGREEMENT' && status === 'SIGNED' && !payload.evidenceUrl) throw new BadRequestException('Link signed agreement evidence');
  if (['DEPLOYMENT','DATABASE','RELEASE'].includes(kind) && ['SUCCEEDED','COMPLETED','READY'].includes(status) && !payload.evidenceUrl) throw new BadRequestException('Completion requires external run evidence');
  for (const key of ['endpoint','evidenceUrl']) if (payload[key]) {
   try { const u = new URL(payload[key]); if (!['https:','http:'].includes(u.protocol) || u.username || u.password) throw new Error(); }
   catch { throw new BadRequestException(`${key} must be an HTTP(S) URL without credentials`); }
  }
  return { title:body.title.trim(), status, priority:body.priority || 'NORMAL', owner:body.owner?.trim() || 'Unassigned', companyId:body.companyId || null, dueAt:body.dueAt ? new Date(body.dueAt) : null, payload:json };
 }
 async save(body: any, actor = 'Provider operator', id?: string) {
  return this.prisma.$transaction(async tx => {
   const old = id ? await tx.controlRecord.findUnique({ where:{ id } }) : null;
   if (id && !old) throw new NotFoundException('Record not found');
   if (old && body.version !== old.version) throw new ConflictException('Record changed; refresh before saving');
   const kind = old?.kind || body.kind, data = this.validate(body, kind);
   if (data.companyId && !await tx.company.findUnique({ where:{ id:data.companyId } })) throw new BadRequestException('Unknown company');
   if (!id && body.requestKey) {
    if (typeof body.requestKey !== 'string' || body.requestKey.length > 100) throw new BadRequestException('Invalid request key');
    const replay = await tx.controlRecord.findUnique({ where:{ requestKey:body.requestKey } });
    if (replay) {
     if (replay.kind !== kind || replay.title !== data.title || replay.payload !== data.payload || replay.status !== data.status || replay.companyId !== data.companyId || replay.owner !== data.owner || replay.priority !== data.priority || replay.dueAt?.toISOString() !== data.dueAt?.toISOString()) throw new ConflictException('Request key already used');
     return this.view(replay);
    }
   }
   const row = id ? await tx.controlRecord.update({ where:{ id, version:old!.version }, data:{ ...data, version:{ increment:1 } } })
    : await tx.controlRecord.create({ data:{ ...data, kind, requestKey:body.requestKey || null } });
   await tx.controlAudit.create({ data:{ recordId:row.id, actor, action:id ? 'UPDATED':'CREATED', details:JSON.stringify({ kind, title:row.title, from:old?.status, status:row.status, version:row.version }) } });
   return this.view(row);
  });
 }
 async database() {
  const [companies, records, auditEvents] = await Promise.all([this.prisma.company.count(),this.prisma.controlRecord.count(),this.prisma.controlAudit.count()]);
  const [check, journal] = await Promise.all([
   this.prisma.$queryRawUnsafe<Array<{ quick_check: string }>>('PRAGMA quick_check'),
   this.prisma.$queryRawUnsafe<Array<{ journal_mode: string }>>('PRAGMA journal_mode'),
  ]);
  return { engine:'SQLite', scope:'Provider database', companies, records, auditEvents, tenantDatabaseAccess:false,
   checkedAt: new Date().toISOString(), integrity: check.length === 1 && check[0].quick_check === 'ok' ? 'ok' : 'Needs investigation',
   journalMode: journal[0]?.journal_mode || 'Unknown', encryption: 'Not verified - use encrypted host storage',
   prismaVersion: Prisma.prismaVersion.client,
   models: Prisma.dmmf.datamodel.models.map(model => ({ name: model.name, fields: model.fields.map(field => ({ name:field.name, type:field.type, required:field.isRequired, relation:field.kind === 'object' })) })),
  };
 }
}
