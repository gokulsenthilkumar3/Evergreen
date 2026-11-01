import { BadRequestException, ConflictException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { Prisma } from '@prisma/admin-client';
import { recordedProof } from './proof';
import { EvidenceService } from './evidence.service';
import { PAYLOAD_FIELDS, projectedPayload } from './payload-policy';
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
 constructor(private readonly prisma: PrismaService, @Optional() private readonly evidence?:EvidenceService) {}
 async system() {
  const [databases, companies, kinds, jobs, audits] = await Promise.all([
   this.prisma.$queryRawUnsafe<Array<{ name: string; file: string }>>('PRAGMA database_list'),
   this.prisma.company.count(),
   this.prisma.controlRecord.groupBy({ by: ['kind'], _count: { _all: true } }),
   this.prisma.releaseJob.count(), this.prisma.controlAudit.count(),
  ]);
  const records = Object.fromEntries(kinds.map(row => [row.kind, row._count._all]));
  return { checkedAt: new Date().toISOString(), database: { engine: 'SQLite', location: databases.find(d => d.name === 'main')?.file || 'In-memory', scope: 'Provider control plane', cloudManaged: false },
   tables: [{ name: 'Company', count: companies }, { name: 'ControlRecord', count: Object.values(records).reduce((a,b) => a+b,0) }, { name: 'ReleaseJob', count: jobs }, { name: 'ControlAudit', count: audits }],
   modules: [
    { name: 'Spinning mills', table: 'Company', read: 'GET /companies', write: 'POST /companies', count: companies, boundary: 'Provider registry; customer ERP data remains separate' },
    ...['TASK','MAINTENANCE','DATABASE','INTEGRATION','WEBHOOK','PAYMENT','AGREEMENT','CHAT'].map(kind => ({ name: kind, table: 'ControlRecord', read: `GET /control/records?kind=${kind}`, write: 'POST /control/records · PATCH /control/records/:id', count: records[kind] || 0, boundary: 'Persisted configuration/evidence; external execution is not inferred' })),
    { name: 'Deployments', table: 'ReleaseJob', read: 'GET /cicd/deployments', write: 'POST /cicd/deploy', count: jobs, boundary: 'Jobs require configured runner and workflow evidence; count includes all release jobs' },
    { name: 'Customer API monitoring', table: 'Customer process memory', read: 'GET /control/customer-apis/:id', write: 'Customer request observer', count: null, boundary: 'Requires configured monitoring connection; counters reset on customer API restart' },
   ] };
 }
 async customerApis(id: string) {
  if (!await this.prisma.company.findUnique({ where: { id }, select: { id: true } })) throw new NotFoundException('Customer not found');
  // Operator-owned allowlist; never fetch a browser-supplied or editable deployment URL.
  let targets: Record<string, { origin: string; tokenEnv: string }>;
  try { targets = JSON.parse(process.env.EVERGREEN_API_MONITORS || '{}'); } catch { throw new BadRequestException('Monitoring configuration is invalid'); }
  const target = targets[id];
  if (!target) return { connected: false, reason: 'No monitoring connection configured for this customer', actions: [] };
  try {
   const origin = new URL(target.origin);
   if (origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash || !(origin.protocol === 'https:' || (origin.protocol === 'http:' && ['127.0.0.1','localhost','[::1]'].includes(origin.hostname)))) throw new Error();
   const token = process.env[target.tokenEnv];
   if (!token || token.length < 32) throw new Error();
   const response = await fetch(new URL('/internal/api-monitor', origin), { headers: { Authorization: `Bearer ${token}` }, redirect: 'error', signal: AbortSignal.timeout(5000) });
   if (!response.ok) throw new Error();
   const data = await response.json();
   if (!Array.isArray(data.actions) || data.actions.length > 10000 || typeof data.startedAt !== 'string') throw new Error();
   return { ...data, connected: true };
  } catch { return { connected: false, reason: 'Monitoring unavailable. Check the configured host and monitoring credential.', actions: [] }; }
 }
 private view(row: any) { return { ...row, payload: JSON.parse(row.payload), proof: recordedProof(row.updatedAt) }; }
 async explore(body: { table?: string; page?: number; tier?: string; preview?: boolean }, actor: string) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new BadRequestException('Choose an allowed provider table');
  const payloadAllowed=process.env.EVERGREEN_EXPLORER_PAYLOAD==='true';
  if(body.tier && !['safe','payload'].includes(body.tier))throw new BadRequestException('Invalid explorer tier');
  const includePayload=body.tier==='payload'&&payloadAllowed;
  if(body.tier==='payload'&&!payloadAllowed&&!body.preview)throw new BadRequestException('Payload access is not enabled by owner policy');
  const redactions=body.table==='ControlRecord'?PAYLOAD_FIELDS.map(field=>({field:'payload.'+field,reason:payloadAllowed?'Available with payload tier':'Requires owner-enabled payload policy'})):[];
  if(body.preview)return {table:body.table,fields:redactions.map(r=>r.field),redactions,granted:payloadAllowed,rows:[],total:0,pageSize:50,scope:'Field names only; no values read'};
  const page = body.page ?? 0;
  if (!Number.isSafeInteger(page) || page < 0 || page > 10000) throw new BadRequestException('Invalid page');
  const args = { take: 50, skip: page * 50 };
  let rows: unknown[], total: number;
  switch (body.table) {
   case 'Company': [rows,total] = await Promise.all([this.prisma.company.findMany({ ...args, orderBy: { createdAt: 'desc' }, select: { id:true,name:true,cloudProvider:true,status:true,plan:true,appVersion:true,lastSyncAt:true,createdAt:true } }), this.prisma.company.count()]); break;
   case 'ControlRecord': [rows,total] = await Promise.all([this.prisma.controlRecord.findMany({ ...args, orderBy: { createdAt: 'desc' }, select: { id:true,kind:true,title:true,status:true,owner:true,version:true,createdAt:true,updatedAt:true,...(includePayload?{payload:true}:{}) } }), this.prisma.controlRecord.count()]); break;
   case 'ReleaseJob': [rows,total] = await Promise.all([this.prisma.releaseJob.findMany({ ...args, orderBy: { createdAt: 'desc' }, select: { id:true,kind:true,target:true,version:true,status:true,actor:true,createdAt:true,updatedAt:true } }), this.prisma.releaseJob.count()]); break;
   case 'ControlAudit': [rows,total] = await Promise.all([this.prisma.controlAudit.findMany({ ...args, orderBy: { createdAt: 'desc' }, select: { id:true,recordId:true,actor:true,action:true,createdAt:true } }), this.prisma.controlAudit.count()]); break;
   default: throw new BadRequestException('Choose an allowed provider table');
  }
  const auditData={actor,action:'DATA_EXPLORER_READ',details:JSON.stringify({table:body.table,page,tier:includePayload?'payload':'safe',rowCount:rows.length})};
  if(this.evidence)await this.prisma.$transaction(async tx=>{const audit=await tx.controlAudit.create({data:auditData});await this.evidence!.append(tx,{sourceKey:'audit:'+audit.id,entityType:'DATA_EXPLORER',entityId:body.table!,title:'Provider '+body.table+' read',actor,action:'READ',state:'executed',payload:JSON.parse(auditData.details)})});else await this.prisma.controlAudit.create({data:auditData});
  if(includePayload)rows=rows.map((row:any)=>({...row,payload:projectedPayload(JSON.parse(row.payload||'{}'))}));
  return { table: body.table, redactions:includePayload?[]:redactions, page, pageSize: 50, total, rows, checkedAt: new Date().toISOString(), scope: 'Owner-authorized provider metadata; credentials and payloads excluded. Each read is audited.' };
 }
 async list(kind?: string) {
  if (kind && !Object.hasOwn(STATES, kind)) throw new BadRequestException('Unknown record type');
  const rows = (await this.prisma.controlRecord.findMany({ where: kind ? { kind } : {}, orderBy: { updatedAt:'desc' }, take:1000 })).map((r: any) => this.view(r));
  return this.evidence?this.evidence.decorate(rows):rows;
 }
 audit() { return this.prisma.controlAudit.findMany({ orderBy:{ createdAt:'desc' }, take:250 }); }
 async record(id:string){const row=await this.prisma.controlRecord.findUnique({where:{id}});if(!row)throw new NotFoundException('Record not found');const rows=[this.view(row)];return (this.evidence?await this.evidence.decorate(rows):rows)[0]}
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
   const audit = await tx.controlAudit.create({ data:{ recordId:row.id, actor, action:id ? 'UPDATED':'CREATED', details:JSON.stringify({ kind, title:row.title, from:old?.status, status:row.status, version:row.version }) } });
   if(this.evidence)await this.evidence.append(tx,{sourceKey:'audit:'+audit.id,entityType:kind,entityId:row.id,title:row.title,actor,action:id?'UPDATED':'CREATED',state:'recorded',payload:{version:row.version,status:row.status}});
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
