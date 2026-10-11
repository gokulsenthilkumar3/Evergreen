export type Kind = 'TASK'|'MAINTENANCE'|'DATABASE'|'API'|'WEBHOOK'|'INTEGRATION'|'PAYMENT'|'AGREEMENT'|'INCIDENT'|'RUNBOOK'|'CHAT'|'AGENT'|'RELEASE'|'DEPLOYMENT'|'INQUIRY'|'DASHBOARD';
export interface RecordItem { id:string; kind:Kind; title:string; status:string; priority:string; owner:string; companyId?:string|null; dueAt?:string|null; payload:Record<string, string|number|boolean>; version:number; createdAt:string; updatedAt:string; requestKey?:string }
export interface Tenant { id:string; name:string; cloudProvider:string; plan:string; status:string; appVersion:string; activeStaff:number; docsPosted:number; maxUsers:number; maxMachines:number; maxDocsPerMonth:number; expiresAt:string|null; isMaintenance:boolean; lastSyncAt:string|null }
export interface Audit { id:string; action:string; actor:string; details:string; createdAt:string }
export interface Connector { id:string; name:string; category:string; mark:string; color:string; description:string; docs:string; auth:string; events:string }
export const STATES:Record<Kind,string[]> = {
 TASK:['OPEN','IN_PROGRESS','BLOCKED','DONE'],MAINTENANCE:['SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED'],DATABASE:['REQUESTED','IN_PROGRESS','COMPLETED','FAILED'],API:['DRAFT','ACTIVE','DISABLED'],WEBHOOK:['DRAFT','CONFIGURED','DISABLED'],INTEGRATION:['NOT_CONFIGURED','CONFIGURED','DISABLED'],PAYMENT:['PENDING','VERIFIED','DISPUTED','REFUNDED'],AGREEMENT:['DRAFT','IN_REVIEW','SIGNED','EXPIRED'],INCIDENT:['OPEN','INVESTIGATING','MONITORING','RESOLVED'],RUNBOOK:['DRAFT','REVIEWED','ARCHIVED'],CHAT:['POSTED'],AGENT:['DRAFT','CONFIGURED','PAUSED'],RELEASE:['DRAFT','BUILDING','READY','FAILED'],DEPLOYMENT:['QUEUED','RUNNING','SUCCEEDED','FAILED','CANCELLED'],INQUIRY:['NEW','CONTACTED','QUALIFIED','CLOSED'],DASHBOARD:['SAVED'],
};
export const uid = () => globalThis.crypto.randomUUID?.() ?? Array.from(crypto.getRandomValues(new Uint32Array(4)), n => n.toString(16)).join('');
const now = new Date();
const ago = (hours:number) => new Date(now.getTime()-hours*3600000).toISOString();
const future = (days:number) => new Date(now.getTime()+days*86400000).toISOString();
export const DEMO_TENANTS:Tenant[] = [
 {id:'demo-1',name:'Evergreen Spinning · Unit 01',cloudProvider:'GCP',plan:'GROWTH',status:'ACTIVE',appVersion:'1.2.4',activeStaff:12,docsPosted:1482,maxUsers:20,maxMachines:40,maxDocsPerMonth:5000,expiresAt:future(180),isMaintenance:false,lastSyncAt:ago(.1)},
 {id:'demo-2',name:'Evergreen Textiles · Unit 02',cloudProvider:'AZURE',plan:'SCALE',status:'ACTIVE',appVersion:'1.2.4',activeStaff:28,docsPosted:3810,maxUsers:50,maxMachines:80,maxDocsPerMonth:10000,expiresAt:future(12),isMaintenance:false,lastSyncAt:ago(.3)},
 {id:'demo-3',name:'Evergreen Cotton · Pilot',cloudProvider:'LOCAL_VM',plan:'SEED',status:'GRACE_PERIOD',appVersion:'1.2.3',activeStaff:4,docsPosted:340,maxUsers:5,maxMachines:10,maxDocsPerMonth:500,expiresAt:ago(48),isMaintenance:false,lastSyncAt:ago(5)},
 {id:'demo-4',name:'Evergreen Weaving · Unit 04',cloudProvider:'AWS',plan:'GROWTH',status:'ACTIVE',appVersion:'1.2.4',activeStaff:9,docsPosted:962,maxUsers:15,maxMachines:30,maxDocsPerMonth:5000,expiresAt:future(90),isMaintenance:true,lastSyncAt:ago(.6)},
];
const sample = (id:string,kind:Kind,title:string,status:string,payload:RecordItem['payload']={},companyId='demo-1',priority='NORMAL',owner='Evergreen Ops',hours=1):RecordItem => ({ id,kind,title,status,payload,companyId,priority,owner,version:1,createdAt:ago(hours),updatedAt:ago(hours) });
export const DEMO_RECORDS:RecordItem[] = [
 sample('dep-1','DEPLOYMENT','Tenant API · production rollout','SUCCEEDED',{version:'1.2.4',environment:'Production',provider:'GCP',strategy:'Rolling',evidenceUrl:'https://example.com/demo/run-1042',description:'Illustrative deployment record. No infrastructure was changed.'}),
 sample('dep-2','DEPLOYMENT','Book-Ellam · staging verification','RUNNING',{version:'1.2.5-rc.1',environment:'Staging',provider:'AZURE',strategy:'Canary',description:'Sample run awaiting acceptance checks.'},'demo-2','NORMAL','Evergreen Engineering',.4),
 sample('dep-3','DEPLOYMENT','Pilot workstation · update request','QUEUED',{version:'1.2.4',environment:'Production',provider:'LOCAL_VM',strategy:'Rolling'},'demo-3','HIGH','Evergreen Ops',2),
 sample('rel-1','RELEASE','October operational update','READY',{version:'1.2.4',branch:'main',commit:'demo-7f29a1',evidenceUrl:'https://example.com/demo/release-124',description:'Sample release: receiving history, improved registers and reconciliation.'}),
 sample('task-1','TASK','Confirm pilot moisture contract','IN_PROGRESS',{description:'Review source contract and record the agreed calculation before settlement automation.'},'demo-3','HIGH','Priya · Customer success'),
 sample('task-2','TASK','Review staging deployment evidence','OPEN',{description:'Check the build report, backup and rollback plan.'},'demo-2','HIGH','Arun · Engineering',3),
 sample('task-3','TASK','Prepare next renewal conversation','OPEN',{description:'Confirm scope, seats and support requirements with the pilot accountant.'},'demo-3','NORMAL','Meera · Commercial',5),
 sample('task-4','TASK','Document operator onboarding','DONE',{description:'Receiving, correction and daily reconciliation checklist.'},'demo-1','LOW','Priya · Customer success',12),
 sample('inc-1','INCIDENT','Pilot heartbeat needs investigation','INVESTIGATING',{description:'Demo scenario: check network and the tenant sync configuration before assuming downtime.'},'demo-3','HIGH','Arun · Engineering',2),
 {...sample('mnt-1','MAINTENANCE','Monthly backup restore exercise','SCHEDULED',{description:'Restore to an isolated environment; verify record counts and sample transactions.',duration:'45 minutes'},'demo-4'),dueAt:future(2)},
 sample('db-1','DATABASE','Provider backup verification','COMPLETED',{provider:'SQLite',description:'Illustrative restore check, not a live backup.',evidenceUrl:'https://example.com/demo/backup-22'}),
 sample('api-1','API','Provider management API','DRAFT',{endpoint:'http://localhost:4300',auth:'Bearer token',scope:'Provider records',description:'Configure a server-side provider key before live access.'}),
 sample('hook-1','WEBHOOK','Payment reconciliation events','DRAFT',{provider:'Razorpay',events:'payment.captured, payment.failed',endpoint:'https://example.com/webhooks/razorpay',description:'Requires raw-body signature verification and idempotent event handling.'}),
 sample('pay-1','PAYMENT','October Growth subscription','VERIFIED',{amountPaise:799900,currency:'INR',provider:'Razorpay',reference:'DEMO-PAY-1042',description:'Sample payment record. No money moved.'},'demo-1','NORMAL','Meera · Commercial'),
 sample('pay-2','PAYMENT','Pilot onboarding invoice','PENDING',{amountPaise:1500000,currency:'INR',provider:'PhonePe',reference:'DEMO-INV-1043'},'demo-3','HIGH','Meera · Commercial'),
 {...sample('agr-1','AGREEMENT','Evergreen Unit 01 · service agreement','SIGNED',{reference:'DEMO-MSA-001',evidenceUrl:'https://example.com/demo/agreement',description:'Sample agreement register. Not a legal template or executed contract.'}),dueAt:future(180)},
 sample('agr-2','AGREEMENT','Pilot scope and acceptance criteria','IN_REVIEW',{reference:'DEMO-SOW-004',description:'Receiving, moisture policy review, supplier reconciliation and Tally test-company acceptance.'},'demo-3','HIGH','Meera · Commercial'),
 sample('chat-1','CHAT','Pilot readiness',{channel:'operations',message:'The pilot receipt workflow is ready for the accountant walkthrough. Let’s confirm the contract terms next.'} as unknown as string),
 sample('run-1','RUNBOOK','Platform health check','REVIEWED',{script:'node scripts/provider-ops.mjs health',description:'Read-only HTTP checks for each local surface. No restart or deployment.'}),
 sample('run-2','RUNBOOK','SQLite backup','REVIEWED',{script:'python scripts/backup-sqlite.py --source <database> --destination <backup-folder>',description:'Creates a consistent, timestamped SQLite backup; never overwrites a prior backup.'}),
 sample('agent-1','AGENT','Operations brief','DRAFT',{provider:'OpenAI',model:'Configure on server',description:'Read-only operational summaries. No deployment, payment or database tools.'}),
 sample('lead-1','INQUIRY','Spinning mill pilot enquiry','NEW',{contact:'Demo buyer',email:'buyer@evergreen.example',description:'Interested in inward receiving and accountant reconciliation.'},'','NORMAL','Priya · Customer success'),
];
// An explicit demo conversation, separate from real team communications.
DEMO_RECORDS[16] = sample('chat-1','CHAT','Pilot readiness','POSTED',{channel:'operations',message:'The receipt workflow is ready for the accountant walkthrough. Let’s confirm the contract terms next.'},'','NORMAL','Priya · Customer success');

export const CONNECTORS:Connector[] = [
 ['github','GitHub','Developer','GH','#cdd9e5','Repositories, Actions and release evidence','https://docs.github.com/en/webhooks','GitHub App / secret reference','workflow_run, release'],
 ['azure-devops','Azure DevOps','Developer','Az','#62afff','Pipelines, work items and artifacts','https://learn.microsoft.com/en-us/azure/devops/service-hooks/overview','Service connection','build.complete'],
 ['gcp','Google Cloud','Cloud','G','#fbbc04','Tenant projects, deployment and monitoring','https://cloud.google.com/docs','Workload identity','Deployment and health'],
 ['azure','Microsoft Azure','Cloud','Az','#57abff','Tenant resources and managed services','https://learn.microsoft.com/en-us/azure/','Managed identity','Resource events'],
 ['aws','Amazon Web Services','Cloud','aws','#ffb454','Tenant accounts and container infrastructure','https://docs.aws.amazon.com/','IAM role','CloudWatch / EventBridge'],
 ['local','Private infrastructure','Cloud','<>','#93c5b8','Factory VM, private cloud or custom runner','https://docs.docker.com/','Runner identity','Job results'],
 ['razorpay','Razorpay','Payments','R','#65a7ff','India payment and settlement workflow','https://razorpay.com/docs/webhooks/','Server key + webhook secret','payment.captured, payment.failed'],
 ['phonepe','PhonePe','Payments','Pe','#bba0ff','India checkout and payment status','https://developer.phonepe.com/','Merchant credentials','Order status callback'],
 ['paytm','Paytm','Payments','pay','#50cfff','India checkout, callbacks and reconciliation','https://business.paytm.com/docs/','Merchant key reference','Payment status'],
 ['stripe','Stripe','Payments','S','#a69aff','International checkout and subscriptions','https://docs.stripe.com/webhooks','Server key + signing secret','invoice.paid, payment_intent.succeeded'],
 ['revolut','Revolut','Payments','Re','#f0f3f6','Merchant payments, subject to eligibility','https://developer.revolut.com/','Merchant API credentials','Order lifecycle'],
 ['slack','Slack','Communication','S','#e7a0d1','Internal incident and deployment updates','https://api.slack.com/','OAuth app','Message / incident notifications'],
 ['whatsapp','WhatsApp Business','Communication','W','#53d5a1','Customer conversations and approved templates','https://developers.facebook.com/docs/whatsapp/','Business app credentials','Messages and delivery status'],
 ['teams','Microsoft Teams','Communication','T','#a5a7ff','Team conversations and operations workflow','https://learn.microsoft.com/en-us/microsoftteams/platform/','Entra app / workflow','Activity and notifications'],
 ['zoho','Zoho One','Business suite','Zo','#f3c965','CRM, Desk, Books, Sign, Mail and Flow','https://www.zoho.com/one/applications/web.html','OAuth, data-center specific','Application-specific events'],
 ['google','Google Workspace','Business suite','G','#91c8ff','Gmail, Calendar, Drive and identity','https://developers.google.com/workspace','OAuth scopes','Mail and collaboration events'],
 ['microsoft','Microsoft 365','Business suite','M','#93b8ff','Outlook, Teams, SharePoint and identity','https://learn.microsoft.com/en-us/graph/overview','Entra / Microsoft Graph','Change notifications'],
 ['openai','OpenAI','AI','O','#a0d9c1','Configurable models through the OpenAI API','https://developers.openai.com/api/docs/','OPENAI_API_KEY (server only)','Read-only agent requests'],
 ['anthropic','Anthropic','AI','A','#dfb7a4','Claude through the Anthropic API','https://platform.claude.com/docs/en/api/overview','ANTHROPIC_API_KEY (server only)','Read-only agent requests'],
 ['xai','xAI / Grok','AI','x','#d3dce4','Configurable Grok API models','https://docs.x.ai/','XAI_API_KEY (server only)','Read-only agent requests'],
 ['ollama','Open-source / Ollama','AI','L','#c5d0d9','Self-hosted model endpoint','https://docs.ollama.com/','Operator-configured endpoint','Read-only agent requests'],
 ['tally','TallyPrime','Accounting','T','#edbd77','Existing sales/receipt XML export; purchase bridge in development','https://help.tallysolutions.com/integration-methods-and-technologies/','Local company and ledger mapping','Voucher import results'],
].map(([id,name,category,mark,color,description,docs,auth,events]) => ({id,name,category,mark,color,description,docs,auth,events}));

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
