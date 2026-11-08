export type Kind = 'TASK'|'MAINTENANCE'|'DATABASE'|'API'|'WEBHOOK'|'INTEGRATION'|'PAYMENT'|'AGREEMENT'|'INCIDENT'|'RUNBOOK'|'CHAT'|'AGENT'|'RELEASE'|'DEPLOYMENT'|'INQUIRY'|'DASHBOARD';
export interface RecordItem { id:string; kind:Kind; title:string; status:string; priority:string; owner:string; companyId?:string|null; dueAt?:string|null; payload:Record<string, string|number|boolean>; version:number; createdAt:string; updatedAt:string; requestKey?:string; proof?: import('./redesign/ProofBadge').Proof }
export interface Tenant { id:string; name:string; cloudProvider:string; plan:string; status:string; appVersion:string; activeStaff:number; docsPosted:number; maxUsers:number; maxMachines:number; maxDocsPerMonth:number; expiresAt:string|null; isMaintenance:boolean; lastSyncAt:string|null }
export interface Audit { id:string; action:string; actor:string; details:string; createdAt:string }
export interface Connector { id:string; name:string; category:string; mark:string; color:string; description:string; docs:string; auth:string; events:string }
export const STATES:Record<Kind,string[]> = {
 TASK:['OPEN','IN_PROGRESS','BLOCKED','DONE'],MAINTENANCE:['SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED'],DATABASE:['REQUESTED','IN_PROGRESS','COMPLETED','FAILED'],API:['DRAFT','ACTIVE','DISABLED'],WEBHOOK:['DRAFT','CONFIGURED','DISABLED'],INTEGRATION:['NOT_CONFIGURED','CONFIGURED','DISABLED'],PAYMENT:['PENDING','VERIFIED','DISPUTED','REFUNDED'],AGREEMENT:['DRAFT','IN_REVIEW','SIGNED','EXPIRED'],INCIDENT:['OPEN','INVESTIGATING','MONITORING','RESOLVED'],RUNBOOK:['DRAFT','REVIEWED','ARCHIVED'],CHAT:['POSTED'],AGENT:['DRAFT','CONFIGURED','PAUSED'],RELEASE:['DRAFT','BUILDING','READY','FAILED'],DEPLOYMENT:['QUEUED','RUNNING','SUCCEEDED','FAILED','CANCELLED'],INQUIRY:['NEW','CONTACTED','QUALIFIED','CLOSED'],DASHBOARD:['SAVED'],
};
export const uid = () => globalThis.crypto.randomUUID?.() ?? Array.from(crypto.getRandomValues(new Uint32Array(4)), n => n.toString(16)).join('');
export const money = (paise:number) => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(paise/100);
export const label = (s:string) => s.replaceAll('_',' ').toLowerCase().replace(/^./, c => c.toUpperCase());
export function validateRecord(r:RecordItem):string|undefined {
 if (!r.title.trim()) return 'Give this record a title.';
 if (!STATES[r.kind].includes(r.status)) return 'Choose a valid status.';
 if (r.kind==='PAYMENT' && (!Number.isSafeInteger(r.payload.amountPaise)||Number(r.payload.amountPaise)<=0)) return 'Enter a positive payment amount.';
 if (r.kind==='PAYMENT'&&r.status==='VERIFIED'&&!r.payload.reference) return 'Add a bank or gateway reference before verifying.';
 if (r.kind==='AGREEMENT'&&r.status==='SIGNED'&&!r.payload.evidenceUrl) return 'Link the signed document before recording it as signed.';
 if (['DEPLOYMENT','DATABASE','RELEASE'].includes(r.kind)&&['SUCCEEDED','COMPLETED','READY'].includes(r.status)&&!r.payload.evidenceUrl) return 'Add the external run evidence before recording completion.';
 for (const field of ['endpoint','evidenceUrl']) if(r.payload[field]) { try { const u=new URL(String(r.payload[field]));if(!['http:','https:'].includes(u.protocol)||u.username||u.password) throw new Error(); } catch { return 'Use a valid HTTP(S) URL without credentials.'; } }
 return undefined;
}
