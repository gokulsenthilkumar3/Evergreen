import { useState, useEffect } from 'react';
import AiAssistant from '../../../packages/portal-ui/AiAssistant';
import TextileScene from './TextileScene';
import './App.css';
import { TRANSLATIONS, Language } from './data/translations';
import { InteractiveFactorySimulator } from './components/InteractiveFactorySimulator';
import { YarnRealizationCalculator } from './components/YarnRealizationCalculator';
import { WeighbridgeHardwareMatrix } from './components/WeighbridgeHardwareMatrix';
import { ProductTourModal } from './components/ProductTourModal';
import { InteractiveCaseStudies } from './components/InteractiveCaseStudies';
import { Toast } from './components/Toast';

/* ─── DATA ────────────────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { href: '#platform', labelKey: 'platform', fallback: 'Platform' },
  { href: '#simulator', labelKey: 'simulators', fallback: 'Live Simulator' },
  { href: '#features', labelKey: 'features', fallback: 'Features' },
  { href: '#calculator', labelKey: 'calculator', fallback: 'ROI Matrix' },
  { href: '#hardware', labelKey: 'hardware', fallback: 'Hardware' },
  { href: '#pricing', labelKey: 'pricing', fallback: 'Pricing' },
  { href: '#integrations', labelKey: 'integrations', fallback: 'Integrations' },
  { href: '#case-studies', labelKey: 'caseStudies', fallback: 'Case Studies' },
  { href: '#support', labelKey: 'support', fallback: 'Support' },
];

const STATS = [
  { val: '140K+', label: 'Active Spindles Managed', color: 'var(--emerald)' },
  { val: '₹18.4L', label: 'Moisture Fraud Caught (Live)', color: 'var(--amber)' },
  { val: '30 Days', label: 'Unrestricted Grace Quota', color: 'var(--sky)' },
  { val: '< 3 Min', label: 'Instant Reactivation SLA', color: 'var(--purple)' },
  { val: '99.98%', label: 'Multi-Cloud Uptime', color: 'var(--emerald)' },
  { val: '4 Clouds', label: 'GCP · AWS · Azure · Local VM', color: 'var(--sky)' },
];

const FEATURES = [
  {
    icon: '⚖️', tag: 'ANTI-FRAUD', title: 'TareZero Weighbridge Gateway',
    desc: 'RS-232 serial hardware integration with Avery, Essae & Mettler indicators. Cryptographic moisture deduction logs. Catches invisible weight fraud in real time.',
    color: 'amber',
    items: ['Hardware-level tare locking', 'SIMA/CCI moisture deduction standards', 'Anti-tamper audit trail', 'QR-coded lot slips'],
  },
  {
    icon: '📑', tag: 'ACCOUNTING', title: 'Tally Prime XML Bridge',
    desc: 'Zero-duplicate purchase, sales & receipt vouchers auto-generated as valid Tally Prime XML. One click imports — your accountant stays in Tally forever.',
    color: 'cyan',
    items: ['CGST / SGST / IGST auto-split', 'E-Way Bill generation', 'Multi-company ledger mapping', 'Day Book cross-register search'],
  },
  {
    icon: '📱', tag: 'COLLECTIONS', title: 'WhatsApp Collections Engine',
    desc: 'Bilingual payment reminders in Tamil & English sent directly to buyer WhatsApp. Tracks UTR confirmations and automatically updates ledger balances.',
    color: 'green',
    items: ['Tamil & English bilingual', 'Auto UTR confirmation', 'Ledger balance sync', 'Outstanding report generator'],
  },
  {
    icon: '🔬', tag: 'INTELLIGENCE', title: 'Book-Ellam (புக் எல்லாம்)',
    desc: 'The traditional South Indian textile all-books audit engine. Search across Day Book, Inward, Outward, and Party Khata registers simultaneously with natural language.',
    color: 'purple',
    items: ['Cross-register search', 'Party ledger history', 'Comber noil & waste matrix', 'Shift production variance'],
  },
  {
    icon: '🌩️', tag: 'DEPLOYMENT', title: '1-Click Multi-Cloud Deploy',
    desc: 'Self-deploying install script for Local Linux VM, GCP Cloud Run, AWS ECS, or Azure Container Apps. Hermetically sealed Docker OCI with rolling zero-downtime upgrades.',
    color: 'blue',
    items: ['Rolling / Blue-Green / Canary', 'Isolated SQLite per tenant', 'Zero vendor lock-in', 'Air-gapped factory support'],
  },
  {
    icon: '🛡️', tag: 'COMPLIANCE', title: 'Owner-Controlled Licence Periods',
    desc: 'The owner defines activation periods and signed offline deadlines. Renew before expiry; an expired activation blocks access until a valid licence is installed.',
    color: 'amber',
    items: ['Signed offline validity', 'Sales & support SLA alerts', 'UTR-verified 3-min reactivation', 'Cryptographic audit log'],
  },
];

const TIERS = [
  {
    name: 'Gatekeeper P0', badge: 'ANTI-FRAUD ENTRY', price: 3999, period: 'month',
    desc: 'Weighbridge + Tally Prime XML integration for mills who want fraud prevention first.',
    color: 'amber', popular: false,
    features: ['TareZero Weighbridge Gateway', 'Tally XML export', 'Anti-tamper moisture log', '1 Weighbridge station', '30-Day Active Grace', '< 3 min reactivation'],
    cta: 'Start Gatekeeper',
  },
  {
    name: 'Growth', badge: 'MOST POPULAR', price: 7999, period: 'month',
    desc: 'Full-scale spinning mill up to 25,000 spindles. Everything from inward to GST dispatch.',
    color: 'emerald', popular: true,
    features: ['Everything in Gatekeeper', 'Book-Ellam Audit Engine', 'WhatsApp Collections', 'Up to 10 staff logins', 'Up to 50 machines', '10,000 docs/month'],
    cta: 'Deploy Growth Plan',
  },
  {
    name: 'Scale Enterprise', badge: 'LARGE MILLS', price: 14999, period: 'month',
    desc: 'Composite textile group — multi-unit spinning, weaving & export processing.',
    color: 'purple', popular: false,
    features: ['Everything in Growth', 'Unlimited staff & machines', 'Real-time Digital Twin dashboard', 'Custom Tally connector', 'Dedicated SLA engineer', 'Custom VPC peering (GCP/AWS)'],
    cta: 'Contact Enterprise Sales',
  },
  {
    name: 'Pay-As-You-Go', badge: 'FLEXIBLE', price: 0, period: 'per bale',
    desc: 'Cotton brokers, job-work units, or seasonal mills. Pay only for what you process.',
    color: 'sky', popular: false,
    features: ['₹12 per cotton bale inward', '₹4 per GST invoice', 'No monthly commitment', 'Weighbridge included', 'Standard grace policy', 'Upgrade anytime'],
    cta: 'Start PAYG',
  },
];

export interface IntegrationConnector {
  id: string;
  name: string;
  logo: string;
  desc: string;
  category: 'India Payments' | 'Global Payments' | 'Multi-Cloud' | 'CI/CD & Dev' | 'AI Providers' | 'Business Suites' | 'Comms & Alerts' | 'Hardware & ERP';
  protocol: string;
  status: 'CERTIFIED' | 'PLUG_AND_PLAY' | 'CONFIGURABLE' | 'PLANNED';
  latencyMs: number;
  supportedEvents: string[];
  snippet: string;
}

const INTEGRATIONS: IntegrationConnector[] = [
  // India Payments
  {
    id: 'razorpay',
    name: 'Razorpay India',
    logo: '💳',
    desc: 'Instant settlement UPI, Netbanking, corporate credit cards & auto-reconciliation',
    category: 'India Payments',
    protocol: 'REST API + HMAC SHA-256 Webhook',
    status: 'PLANNED',
    latencyMs: 38,
    supportedEvents: ['payment.captured', 'payment.failed', 'order.paid', 'refund.processed'],
    snippet: '{\n  "event": "payment.captured",\n  "entity": "payment",\n  "amount": 799900,\n  "currency": "INR",\n  "method": "upi",\n  "utr": "428190218821"\n}',
  },
  {
    id: 'phonepe',
    name: 'PhonePe Payment Gateway',
    logo: '🟣',
    desc: 'Instant UPI Intent, Merchant Dynamic QR & Fast Automated Settlement',
    category: 'India Payments',
    protocol: 'Server-to-Server SHA-256 Checksum (X-VERIFY)',
    status: 'PLANNED',
    latencyMs: 32,
    supportedEvents: ['PAYMENT_SUCCESS', 'PAYMENT_ERROR', 'REFUND_PENDING'],
    snippet: '{\n  "responseCode": "SUCCESS",\n  "merchantTransactionId": "TXN_EVE_9921",\n  "amount": 1499900,\n  "providerReferenceId": "T241011142918"\n}',
  },
  {
    id: 'paytm',
    name: 'Paytm Business Gateway',
    logo: '🔷',
    desc: 'All-in-one QR, Soundbox callbacks, netbanking & card checkout',
    category: 'India Payments',
    protocol: 'Paytm Checksum Hash + Callback Webhook',
    status: 'PLANNED',
    latencyMs: 40,
    supportedEvents: ['TXN_SUCCESS', 'TXN_FAILURE', 'REFUND_SUCCESS'],
    snippet: '{\n  "STATUS": "TXN_SUCCESS",\n  "ORDERID": "ORDER_EVE_1042",\n  "TXNAMOUNT": "3999.00",\n  "BANKTXNID": "981248012"\n}',
  },
  // Global Payments
  {
    id: 'stripe',
    name: 'Stripe Global',
    logo: '🌐',
    desc: 'Multi-currency credit cards, SEPA, and recurring automated SaaS billing',
    category: 'Global Payments',
    protocol: 'REST API + Stripe-Signature Webhooks',
    status: 'PLANNED',
    latencyMs: 65,
    supportedEvents: ['invoice.paid', 'payment_intent.succeeded', 'customer.subscription.updated'],
    snippet: '{\n  "id": "evt_1P8x...",\n  "type": "invoice.paid",\n  "data": { "amount_paid": 18000, "currency": "usd" }\n}',
  },
  {
    id: 'revolut',
    name: 'Revolut Business',
    logo: '⚡',
    desc: 'Cross-border merchant payouts & European cotton/yarn export trade FX',
    category: 'Global Payments',
    protocol: 'Revolut Merchant API + Webhook Secret',
    status: 'PLANNED',
    latencyMs: 72,
    supportedEvents: ['ORDER_COMPLETED', 'PAYOUT_SENT'],
    snippet: '{\n  "event": "ORDER_COMPLETED",\n  "order_id": "rev_ord_882",\n  "currency": "EUR"\n}',
  },
  // Multi-Cloud
  {
    id: 'gcp',
    name: 'Google Cloud (GCP)',
    logo: '☁️',
    desc: 'Cloud Run & GKE low-latency Mumbai (asia-south1) and Delhi clusters',
    category: 'Multi-Cloud',
    protocol: 'gcloud CLI / Terraform / OCI Container Registry',
    status: 'PLANNED',
    latencyMs: 14,
    supportedEvents: ['cloud_run.revision_ready', 'artifact_registry.image_pushed'],
    snippet: 'gcloud run deploy evergreen-mill \\\n  --image gcr.io/evergreen-os/tenant:v1.2.4-lts \\\n  --region asia-south1 --min-instances 1',
  },
  {
    id: 'aws',
    name: 'Amazon Web Services (AWS)',
    logo: '🟠',
    desc: 'ECS Fargate container tasks with S3 encrypted immutable backups',
    category: 'Multi-Cloud',
    protocol: 'AWS CLI / CloudFormation / ECR Registry',
    status: 'PLANNED',
    latencyMs: 18,
    supportedEvents: ['ecs.task_running', 's3.backup_written'],
    snippet: 'aws ecs update-service \\\n  --cluster evergreen-prod \\\n  --service mill-tenant \\\n  --force-new-deployment',
  },
  {
    id: 'azure',
    name: 'Microsoft Azure',
    logo: '🔵',
    desc: 'Azure Container Apps & Virtual Networks with Entra ID security',
    category: 'Multi-Cloud',
    protocol: 'Azure CLI / Bicep / ACR',
    status: 'PLANNED',
    latencyMs: 20,
    supportedEvents: ['containerapp.provisioning_state', 'acr.image_push'],
    snippet: 'az containerapp update \\\n  --name evergreen-tenant \\\n  --resource-group EvergreenRG \\\n  --image evergreenos/tenant:v1.2.4-lts',
  },
  {
    id: 'local-vm',
    name: 'On-Premise Linux VM / NUC',
    logo: '🖥️',
    desc: 'Factory-floor edge appliance running offline with zero cloud dependency',
    category: 'Multi-Cloud',
    protocol: 'Docker Compose / Systemd / SQLite WAL',
    status: 'PLANNED',
    latencyMs: 1,
    supportedEvents: ['edge.heartbeat_ok', 'sqlite.wal_checkpoint'],
    snippet: 'Use the reviewed owner-hosted deployment guide. Configure licensing, hosting and backups before starting the services.',
  },
  // CI/CD & Dev
  {
    id: 'github',
    name: 'GitHub Actions',
    logo: '🐙',
    desc: 'Continuous delivery workflow runs, semantic release tags & OCI packages',
    category: 'CI/CD & Dev',
    protocol: 'GitHub App / PAT Token / Octokit API',
    status: 'PLANNED',
    latencyMs: 28,
    supportedEvents: ['workflow_run.completed', 'release.published', 'push.main'],
    snippet: 'gh workflow run deploy-tenant.yml \\\n  -f version=v1.2.4-lts \\\n  -f cluster=gcp-mumbai-01',
  },
  {
    id: 'azure-devops',
    name: 'Azure DevOps Pipelines',
    logo: '🔷',
    desc: 'Enterprise multi-stage release pipelines, work items & artifact feeds',
    category: 'CI/CD & Dev',
    protocol: 'Service Connection / Personal Access Token',
    status: 'PLANNED',
    latencyMs: 32,
    supportedEvents: ['build.complete', 'release.deployment.succeeded'],
    snippet: 'az pipelines run --name "Evergreen-MultiCloud-CD" \\\n  --variables ReleaseVersion=1.2.4',
  },
  {
    id: 'gitlab',
    name: 'GitLab CI/CD',
    logo: '🦊',
    desc: 'Self-hosted and private cloud runners with container image vulnerability scans',
    category: 'CI/CD & Dev',
    protocol: 'GitLab Webhooks + Pipeline Trigger Tokens',
    status: 'PLANNED',
    latencyMs: 30,
    supportedEvents: ['pipeline.status', 'job.failed'],
    snippet: 'curl -X POST \\\n  --form token=GL_TRIGGER_TOKEN \\\n  --form ref=main \\\n  https://gitlab.com/api/v4/projects/12/trigger/pipeline',
  },
  // AI Providers
  {
    id: 'anthropic',
    name: 'Anthropic Claude 3.5 Sonnet',
    logo: '🧠',
    desc: 'Deep spindle yield anomaly analysis, moisture triage & contract extraction',
    category: 'AI Providers',
    protocol: 'Anthropic REST API (Messages API v1)',
    status: 'PLANNED',
    latencyMs: 780,
    supportedEvents: ['claude.analysis_completed', 'claude.triage_alert'],
    snippet: 'anthropic.messages.create({\n  model: "claude-3-5-sonnet-20241022",\n  messages: [{ role: "user", content: "Analyze Tirupur weighbridge variance..." }]\n})',
  },
  {
    id: 'openai',
    name: 'OpenAI ChatGPT (GPT-4o)',
    logo: '🤖',
    desc: 'Multi-modal cotton lot slip OCR, natural language queries & multilingual support',
    category: 'AI Providers',
    protocol: 'OpenAI Chat Completions API v1',
    status: 'PLANNED',
    latencyMs: 620,
    supportedEvents: ['chat.completion.chunk', 'vision.ocr_extracted'],
    snippet: 'openai.chat.completions.create({\n  model: "gpt-4o",\n  messages: [{ role: "user", content: "Audit Book-Ellam inward discrepancy..." }]\n})',
  },
  {
    id: 'grok',
    name: 'xAI Grok-2',
    logo: '⚡',
    desc: 'Real-time cotton index trend analysis, MCX candy market sentiment & price forecasting',
    category: 'AI Providers',
    protocol: 'xAI REST API SDK',
    status: 'PLANNED',
    latencyMs: 580,
    supportedEvents: ['grok.completion', 'market.sentiment_alert'],
    snippet: 'xai.chat.create({\n  model: "grok-2",\n  prompt: "Predict Gujarat S-6 cotton candy trend next 14 days..."\n})',
  },
  {
    id: 'ollama',
    name: 'Open-Source / Ollama',
    logo: '🦙',
    desc: '100% private, on-premise Llama 3.3 / Mistral LLM running inside the mill LAN with zero data leaks',
    category: 'AI Providers',
    protocol: 'Local HTTP REST endpoint (http://localhost:11434)',
    status: 'PLANNED',
    latencyMs: 42,
    supportedEvents: ['ollama.generate_stream', 'local_inference.done'],
    snippet: 'curl http://localhost:11434/api/generate -d \'{\n  "model": "llama3.3",\n  "prompt": "Summarize shift A ring frame CSP scores"\n}\'',
  },
  // Business Suites
  {
    id: 'zoho-one',
    name: 'Zoho One Suite',
    logo: '💼',
    desc: 'Bi-directional sync with Zoho Books, Zoho Desk, Zoho CRM, Zoho Sign & Flow',
    category: 'Business Suites',
    protocol: 'Zoho OAuth 2.0 + Webhooks',
    status: 'PLANNED',
    latencyMs: 50,
    supportedEvents: ['zoho.invoice_created', 'zoho.desk_ticket_opened', 'zoho.sign_completed'],
    snippet: '{\n  "operation": "SYNC_INVOICE",\n  "zoho_module": "books",\n  "customer_id": "ZCUST_9918",\n  "status": "APPROVED"\n}',
  },
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    logo: '📨',
    desc: 'Automated dispatch PDF delivery via Gmail, Google Sheets live export & Drive archival',
    category: 'Business Suites',
    protocol: 'Google Workspace API / Service Account',
    status: 'PLANNED',
    latencyMs: 45,
    supportedEvents: ['gmail.message_dispatched', 'sheets.append_row'],
    snippet: 'sheets.spreadsheets.values.append({\n  spreadsheetId: "1X9...",\n  range: "BaleLog!A:F",\n  valueInputOption: "RAW"\n})',
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    logo: '📊',
    desc: 'Outlook executive digests, Excel PowerQuery connectivity & SharePoint invoice archives',
    category: 'Business Suites',
    protocol: 'Microsoft Graph API + Entra ID',
    status: 'PLANNED',
    latencyMs: 48,
    supportedEvents: ['graph.mail_sent', 'sharepoint.file_archived'],
    snippet: 'graphClient.api("/users/cfo@mill.com/sendMail").post({\n  message: { subject: "EverGreen Daily Shift P&L Summary" }\n})',
  },
  // Comms & Alerts
  {
    id: 'whatsapp',
    name: 'WhatsApp Business API',
    logo: '📱',
    desc: 'Bilingual payment reminders in Tamil & English with instant UTR confirmation & dispatch slips',
    category: 'Comms & Alerts',
    protocol: 'Meta Cloud API / Gupshup / Twilio',
    status: 'PLANNED',
    latencyMs: 80,
    supportedEvents: ['messages.delivered', 'messages.read', 'messages.inbound_utr'],
    snippet: '{\n  "messaging_product": "whatsapp",\n  "to": "+919842755200",\n  "type": "template",\n  "template": { "name": "yarn_dispatch_tamil_v2" }\n}',
  },
  {
    id: 'slack',
    name: 'Slack Alerts & Bot',
    logo: '💬',
    desc: 'Real-time weighbridge fraud alerts, deployment notifications & engineer incident rooms',
    category: 'Comms & Alerts',
    protocol: 'Slack Incoming Webhooks & Bot OAuth',
    status: 'PLANNED',
    latencyMs: 35,
    supportedEvents: ['weighbridge.moisture_alert', 'deploy.completed', 'license.grace_warning'],
    snippet: '{\n  "channel": "#mill-alerts",\n  "text": "🚨 TareZero Alert: 180 kg excess moisture detected on Lot #4492"\n}',
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    logo: '👥',
    desc: 'Adaptive Cards for morning production summaries, spindle variance & mill owner executive approvals',
    category: 'Comms & Alerts',
    protocol: 'Teams Connector Webhook / Power Automate',
    status: 'PLANNED',
    latencyMs: 44,
    supportedEvents: ['teams.adaptive_card_submitted', 'incident.escalated'],
    snippet: '{\n  "type": "message",\n  "attachments": [{ "contentType": "application/vnd.microsoft.card.adaptive" }]\n}',
  },
  // Hardware & ERP
  {
    id: 'tally',
    name: 'Tally Prime XML Bridge',
    logo: '📑',
    desc: 'Zero-duplicate purchase, sales & receipt vouchers auto-generated as valid Tally XML. Your accountant stays in Tally forever.',
    category: 'Hardware & ERP',
    protocol: 'Direct XML HTTP Post / Local Folder Sync',
    status: 'PLANNED',
    latencyMs: 8,
    supportedEvents: ['tally.voucher_exported', 'tally.ledger_sync_ok'],
    snippet: '<ENVELOPE>\n  <HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>\n  <BODY><IMPORTDATA><REQUESTDATA><VOUCHER VCHTYPE="Purchase">...</VOUCHER></REQUESTDATA></IMPORTDATA></BODY>\n</ENVELOPE>',
  },
  {
    id: 'avery',
    name: 'Avery Weighbridge Indicators',
    logo: '⚖️',
    desc: 'RS-232 serial hardware integration with Avery E1105 / E1205. Hardware-level tare locking catches weight fraud in real time.',
    category: 'Hardware & ERP',
    protocol: 'RS-232 Serial (Baud 9600, 8-N-1) + TareZero Driver',
    status: 'PLANNED',
    latencyMs: 1,
    supportedEvents: ['scale.stable_gross_locked', 'scale.tare_confirmed'],
    snippet: 'SERIAL STREAM >> ST,GS,+034280kg\\r\\n\n[TareZero Cryptographic Signature: SHA256(34280 + Timestamp + HardwareID)]',
  },
  {
    id: 'essae',
    name: 'Essae Weight Indicators',
    logo: '🔢',
    desc: 'Automatic gross/tare weight capture for factory weighbridges and yarn bag dispatch scales',
    category: 'Hardware & ERP',
    protocol: 'RS-232 / RS-485 Continuous Stream',
    status: 'PLANNED',
    latencyMs: 1,
    supportedEvents: ['scale.weight_captured', 'scale.moisture_deduction_logged'],
    snippet: 'SERIAL STREAM >> =021450\\r\\n\n[Essae Indicator 501: Gross 21,450 kg verified]',
  },
  {
    id: 'mettler',
    name: 'Mettler-Toledo Precision Scales',
    logo: '⚙️',
    desc: 'High-precision QC laboratory scales for CSP lea testing and moisture regain determination',
    category: 'Hardware & ERP',
    protocol: 'SICS Protocol / Ethernet TCP Socket',
    status: 'PLANNED',
    latencyMs: 1,
    supportedEvents: ['lab.csp_lea_recorded', 'lab.moisture_regain_pct'],
    snippet: 'SICS CMD >> S\\r\\n\nSICS RSP >> S S      120.45 g\\r\\n',
  },
  {
    id: 'gstn',
    name: 'GSTN E-Way Bill & E-Invoice',
    logo: '🏛️',
    desc: 'Automated 1-click E-Way Bill generation, vehicle number update & IRN QR Code embedding on tax invoices',
    category: 'Hardware & ERP',
    protocol: 'NIC E-Way Bill REST GSP API',
    status: 'PLANNED',
    latencyMs: 110,
    supportedEvents: ['eway.bill_generated', 'einvoice.irn_generated'],
    snippet: '{\n  "Irn": "a1b2c3d4...",\n  "EwbNo": 181092819201,\n  "EwbDt": "11/10/2026 03:20:00",\n  "Status": "ACT"\n}',
  },
  {
    id: 'bank-utr',
    name: 'ICICI / HDFC Corporate Banking',
    logo: '🏦',
    desc: 'Real-time bank statement UTR cross-check for buyer remittances & automated ledger balance updating',
    category: 'Hardware & ERP',
    protocol: 'Corporate Banking Webhook & MT940 / CAMT.053 Feed',
    status: 'PLANNED',
    latencyMs: 90,
    supportedEvents: ['bank.utr_credit_verified', 'bank.statement_reconciled'],
    snippet: '{\n  "AccountNo": "0019283746",\n  "UTR": "HDFCN261011882",\n  "CreditAmount": 240000,\n  "Party": "SRI MURUGAN HANDLOOMS"\n}',
  },
];



const FAQS = [
  {
    category: 'Accounting & Tally',
    q: 'Does EverGreen replace Tally Prime?',
    a: 'No — and that\'s by design. We feed Tally, not compete with it. EverGreen generates Tally-compatible XML vouchers for all transactions. Your accountant stays in Tally. We are the operational layer that handles weighbridge, spindle, and inventory workflows Tally cannot.',
  },
  {
    category: '30-Day Grace & Licensing',
    q: 'What happens when my license expires?',
    a: 'Nothing stops. Your mill operations continue uninterrupted for 30 full days (Active Grace Quota). Our licensing team contacts you for renewal. Once payment is verified (UTR), your license reactivates in under 3 minutes — from anywhere, by our provider admin.',
  },
  {
    category: 'Cloud & Offline',
    q: 'Can it run offline on a local factory PC?',
    a: 'Yes. EverGreen runs natively on a Windows or Linux PC or server inside your mill, with zero cloud dependency. The local SQLite database holds all your data. Telemetry (no PII) syncs hourly to our control plane when internet is available.',
  },
  {
    category: 'Book-Ellam',
    q: 'What is Book-Ellam (புக் எல்லாம்)?',
    a: 'Book-Ellam is our unified audit research engine. It lets your accountant or auditor search all registers simultaneously — Day Book, Inward, Outward, Cotton Ledger, Party Khata — with a single query. Eliminates hours of manual cross-referencing.',
  },
  {
    category: 'Weighbridge & Hardware',
    q: 'How does the Weighbridge anti-fraud system work?',
    a: 'The TareZero system connects directly to your Avery, Essae, or Mettler weighbridge indicator via RS-232 serial. It captures the weight at the hardware level before software can manipulate it, applies SIMA/CCI standard moisture deductions, and creates a cryptographically signed log entry for every bale weighed.',
  },
  {
    category: 'POC & Trials',
    q: 'Is there a trial or POC available?',
    a: 'Yes. We offer a 30-day fully functional POC at your mill with real data. No credit card needed. Our engineer visits (Tirupur / Coimbatore / Erode / Karur cluster) or assists remotely. Contact our sales team to schedule.',
  },
  {
    category: 'Cloud & Offline',
    q: 'What languages does the system support?',
    a: 'English and Tamil (தமிழ்) fully. WhatsApp reminders are bilingual. UI is in English with Tamil labels for mill-floor terminology. Hindi support is in roadmap for North Indian textile clusters (Surat, Ludhiana, Bhilwara).',
  },
  {
    category: 'Pricing & Plans',
    q: 'How is pricing determined?',
    a: 'We offer tiered monthly plans (Gatekeeper, Growth, Scale) and a Pay-As-You-Go option for seasonal or smaller units. All prices are transparent with regional multipliers for Tier-2 cities (lower cost) vs international deployments. No hidden fees.',
  },
];

const SUPPORT_CHANNELS = [
  { icon: '📞', title: 'Phone & WhatsApp Hotline', desc: 'Direct access to South India textile support desk in Tamil & English. <30m SLA.', detail: '+91 98427 55200', cta: 'WhatsApp Us', color: 'green' },
  { icon: '✉️', title: 'Technical Desk', desc: 'Architectural queries, custom Tally bridges, and automated integrations.', detail: 'support@evergreen-os.com', cta: 'Send Email', color: 'blue' },
  { icon: '💬', title: 'Live Engineer Chat', desc: 'Chat directly with our deployment engineers (8 AM – 9 PM IST).', detail: 'Instant Web Response', cta: 'Open Chat', color: 'purple' },
  { icon: '🏭', title: 'On-Site Commissioning', desc: 'Field engineer arrives at your mill for weighbridge serial calibration & operator training.', detail: 'Coimbatore · Tirupur · Karur · Erode', cta: 'Schedule Visit', color: 'amber' },
];

/* ─── COMPONENT ───────────────────────────────────────────────────────────── */
function downloadEnquiry(name: string, value: Record<string, string>) {
  const content = 'EverGreen enquiry draft - not submitted\n\n' + Object.entries(value).map(([field, answer]) => field + ': ' + answer).join('\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = name + '.txt'; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function App() {
  const tenantPortalUrl = import.meta.env.VITE_TENANT_PORTAL_URL || (import.meta.env.DEV ? 'http://localhost:4001/' : null);
  const [lang, setLang] = useState<Language>('en');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [showTourModal, setShowTourModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePersona, setActivePersona] = useState<'OWNER' | 'SPINNER' | 'AUDIT' | 'DEVOPS'>('OWNER');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [faqCategory, setFaqCategory] = useState<string>('All');
  const [faqQuery, setFaqQuery] = useState<string>('');
  const [pricingCycle, setPricingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [deployTarget, setDeployTarget] = useState<'LOCAL_VM' | 'GCP' | 'AWS' | 'AZURE'>('LOCAL_VM');
  const [copied, setCopied] = useState(false);
  const [showPocModal, setShowPocModal] = useState(false);
  const [pocForm, setPocForm] = useState({ name: '', phone: '', company: '', city: '', spindles: '', message: '', millType: 'Ring Spinning Mill' });
  const [pocSubmitted, setPocSubmitted] = useState(false);
  const [activeIntegCategory, setActiveIntegCategory] = useState('All');
  const [integSearch, setIntegSearch] = useState('');
  const [selectedInteg, setSelectedInteg] = useState<IntegrationConnector | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', company: '', message: '', type: 'Sales Enquiry' });
  const [contactSent, setContactSent] = useState(false);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);


  const copyScript = () => {
    const scripts: Record<string, string> = {
      LOCAL_VM: `curl -sSL https://get.evergreen-os.com/install.sh | sudo bash -s -- --target=local-vm`,
      GCP: `gcloud run deploy evergreen-mill --image=gcr.io/evergreen-os/tenant:v1.2.4-lts --region=asia-south1`,
      AWS: `aws ecs create-service --cluster evergreen --service-name mill --task-definition evergreen:1.2.4`,
      AZURE: `az container create --resource-group EvergreenRG --name evergreen-mill --image evergreenos/tenant:v1.2.4-lts`,
    };
    navigator.clipboard?.writeText(scripts[deployTarget]);
    setCopied(true);
    setToastMsg(`${deployTarget} install command copied to clipboard!`);
    setTimeout(() => setCopied(false), 2500);
  };

  const filteredFaqs = FAQS.filter(f => {
    const matchCat = faqCategory === 'All' || f.category === faqCategory;
    const matchQuery = !faqQuery || f.q.toLowerCase().includes(faqQuery.toLowerCase()) || f.a.toLowerCase().includes(faqQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const integCategories = ['All', ...Array.from(new Set(INTEGRATIONS.map(i => i.category)))];
  const filteredIntegs = INTEGRATIONS.filter(i => {
    const matchCat = activeIntegCategory === 'All' || i.category === activeIntegCategory;
    const matchQuery = !integSearch || i.name.toLowerCase().includes(integSearch.toLowerCase()) || i.desc.toLowerCase().includes(integSearch.toLowerCase()) || i.category.toLowerCase().includes(integSearch.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="mkt-page">

      {/* ── ANNOUNCEMENT TICKER ── */}
      <div className="ticker-bar">
        <div className="mkt-container ticker-inner">
          <span className="ticker-badge">{t.ticker.badge}</span>
          <span className="ticker-text">{t.ticker.text}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--emerald-light)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.55rem', borderRadius: 9999 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--emerald)', boxShadow: '0 0 6px var(--emerald)' }} />
              142,840 Spindles Live
            </span>
            <a href="#pricing" className="ticker-cta">{t.ticker.cta}</a>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION ── */}
      <header className={`mkt-nav ${navScrolled ? 'nav-scrolled' : ''}`}>
        <div className="mkt-container nav-inner">
          <a href="#" className="mkt-brand">
            <svg viewBox="0 0 48 48" fill="none" className="mkt-brand-svg">
              <rect width="48" height="48" rx="13" fill="#080f1e" />
              <path d="M24 8L40 18V30L24 40L8 30V18L24 8Z" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" />
              <circle cx="24" cy="24" r="6" fill="url(#mktGrad)" />
              <defs>
                <radialGradient id="mktGrad" cx="40%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0ea5e9" />
                </radialGradient>
              </defs>
            </svg>
            <div>
              <div className="brand-name">EverGreen OS</div>
              <div className="brand-sub">Textile ERP Cloud</div>
            </div>
          </a>

          <nav className={`nav-links ${mobileMenuOpen ? 'open' : ''}`} aria-label="Main navigation">
            {NAV_LINKS.map(l => {
              const label = t.nav[l.labelKey as keyof typeof t.nav] || l.fallback;
              return (
                <a key={l.href} href={l.href} className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                  {label}
                </a>
              );
            })}
            <a href="#scout" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Ask Scout</a>
            <div className="mobile-nav-extra">
              <button
                className="lang-toggle-btn mobile-extra-btn"
                onClick={() => {
                  const nextLang = lang === 'en' ? 'ta' : 'en';
                  setLang(nextLang);
                  setToastMsg(nextLang === 'ta' ? 'தமிழ் மொழிக்கு மாற்றப்பட்டது' : 'Switched to English');
                  setMobileMenuOpen(false);
                }}
                aria-label="Switch Language"
              >
                <span>🌐</span>
                <span>{lang === 'en' ? 'தமிழ்' : 'English'}</span>
              </button>
              <button
                className={`currency-toggle-btn mobile-extra-btn ${currency === 'USD' ? 'active' : ''}`}
                onClick={() => {
                  const nextCur = currency === 'INR' ? 'USD' : 'INR';
                  setCurrency(nextCur);
                  setToastMsg(`Currency display updated to ${nextCur}`);
                  setMobileMenuOpen(false);
                }}
                aria-label="Toggle Currency"
              >
                {currency === 'INR' ? '₹ INR' : '$ USD'}
              </button>
              <a href={tenantPortalUrl || "#contact"} target="_blank" rel="noreferrer" className="nav-link-ghost mobile-extra-btn" onClick={() => setMobileMenuOpen(false)}>
                {tenantPortalUrl ? t.nav.millApp : 'Request portal access'} ↗
              </a>
            </div>
          </nav>

          <div className="nav-actions">
            <button
              className="lang-toggle-btn desktop-utility"
              onClick={() => {
                const nextLang = lang === 'en' ? 'ta' : 'en';
                setLang(nextLang);
                setToastMsg(nextLang === 'ta' ? 'தமிழ் மொழிக்கு மாற்றப்பட்டது' : 'Switched to English');
              }}
              title="Switch Language / மொழியை மாற்றவும்"
              aria-label="Switch Language"
            >
              <span>🌐</span>
              <span>{lang === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>
            <button
              className={`currency-toggle-btn desktop-utility ${currency === 'USD' ? 'active' : ''}`}
              onClick={() => {
                const nextCur = currency === 'INR' ? 'USD' : 'INR';
                setCurrency(nextCur);
                setToastMsg(`Currency display updated to ${nextCur}`);
              }}
              title="Toggle Currency"
              aria-label="Toggle Currency"
            >
              {currency === 'INR' ? '₹ INR' : '$ USD'}
            </button>
            <a href={tenantPortalUrl || "#contact"} target="_blank" rel="noreferrer" className="nav-link-ghost desktop-utility">{tenantPortalUrl ? t.nav.millApp : 'Request portal access'}</a>
            <button className="btn-primary" onClick={() => setShowPocModal(true)}>{t.nav.startPoc}</button>
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="hero-section" id="hero">
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />
        <div className="hero-grid-overlay" />
        <div className="mkt-container hero-content">
          <div className="hero-pill">
            <span className="pulse-dot" />
            {t.hero.badge}
          </div>

          <h1 className="hero-h1">
            {t.hero.h1Line1} <br />
            {t.hero.h1Line2} <span className="gradient-text">{t.hero.h1Gradient}</span>
          </h1>

          <p className="hero-p">
            {t.hero.p}
          </p>

          <div className="hero-ctas">
            <button className="btn-primary btn-xl" onClick={() => setShowPocModal(true)} id="hero-cta">
              {t.hero.startPocBtn}
            </button>
            <button
              className="btn-ghost btn-xl"
              onClick={() => setShowTourModal(true)}
              style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#fff', background: 'rgba(16, 185, 129, 0.08)' }}
            >
              {t.hero.interactiveTourBtn}
            </button>
            <a href="#simulator" className="btn-ghost btn-xl">{t.hero.exploreBtn}</a>
          </div>

          <TextileScene />
          {/* STATS TICKER */}
          <div className="stats-strip">
            {STATS.map((s, i) => (
              <div className="stat-item" key={i}>
                <strong style={{ color: s.color }}>{s.val}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>

          {/* ARCHITECTURE CARD */}
          <div className="arch-card glass-card">
            <div className="arch-card-header">
              <span className="arch-label">⚡ Hub & Spoke Multi-Cloud Architecture</span>
              <span className="arch-badge">SEPARATE DATA PLANES</span>
            </div>
            <div className="arch-nodes">
              <div className="arch-node node-mill">
                <div className="node-icon">🏭</div>
                <div className="node-name">Mill Tenant Spoke</div>
                <div className="node-desc">Local VM / GCP / AWS / Azure</div>
                <div className="node-tags">
                  <span>Isolated SQLite DB</span>
                  <span>Mill operations</span>
                  <span>Book-Ellam Engine</span>
                </div>
              </div>
              <div className="arch-connector">
                <div className="connector-line" />
                <div className="connector-pill">🔒 Encrypted TLS Telemetry<br /><small>Hourly Sync · Zero PII</small></div>
                <div className="connector-line" />
              </div>
              <div className="arch-node node-provider">
                <div className="node-icon">🛡️</div>
                <div className="node-name">Provider Hub</div>
                <div className="node-desc">Owner control plane</div>
                <div className="node-tags">
                  <span>Central Admin DB</span>
                  <span>Signed activation</span>
                  <span>CI/CD Orchestrator</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGOS / TRUST BAR ── */}
      <section className="trust-bar">
        <div className="mkt-container trust-inner">
          <span className="trust-label">Trusted by mills across the Southern Textile Belt</span>
          <div className="trust-logos">
            {['Tirupur Cluster', 'Coimbatore Hub', 'Erode District', 'Karur Region', 'Palladam Corridor', 'Dindigul Mills'].map(c => (
              <span key={c} className="trust-logo-pill">📍 {c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE INTERACTIVE DIGITAL TWIN SIMULATOR ── */}
      <section id="simulator" className="mkt-section bg-alt">
        <div className="mkt-container">
          <div className="section-head">
            <span className="eyebrow">{t.sections.simulatorEyebrow}</span>
            <h2>{t.sections.simulatorTitle}</h2>
            <p>{t.sections.simulatorSubtitle}</p>
          </div>
          <InteractiveFactorySimulator onStartPoc={() => setShowPocModal(true)} lang={lang} />
        </div>
      </section>

      {/* ── PLATFORM OVERVIEW ── */}
      <section id="platform" className="mkt-section">
        <div className="mkt-container">
          <div className="section-head">
            <span className="eyebrow">PLATFORM OVERVIEW</span>
            <h2>Built for the Reality of Textile Manufacturing</h2>
            <p>Not generic ERP. Purpose-built for spinning mills, cotton ginners, and yarn traders in South Asia and beyond.</p>
          </div>

          <div className="persona-tabs">
            {([
              { id: 'OWNER', label: '👑 Mill Owners & Directors' },
              { id: 'SPINNER', label: '⚙️ Factory Floor & Spinners' },
              { id: 'AUDIT', label: '📖 Accountants & Auditors' },
              { id: 'DEVOPS', label: '☁️ IT & Cloud DevOps' },
            ] as { id: typeof activePersona; label: string }[]).map(p => (
              <button
                key={p.id}
                className={`persona-tab ${activePersona === p.id ? 'active' : ''}`}
                onClick={() => setActivePersona(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="persona-panel glass-card">
            {activePersona === 'OWNER' && (
              <div className="persona-grid">
                <div>
                  <h3>Total Commercial Visibility & Profit-Per-Spindle</h3>
                  <p>Stop waiting for month-end Tally sheets. Get real-time per-kilogram yarn costing, EB unit rate attribution, raw cotton purchase parity, and live day-book balances.</p>
                  <ul className="check-list">
                    <li><strong>Live Margin Tracker:</strong> Cotton price vs. yarn sales realization per count, per shift.</li>
                    <li><strong>Zero Stock Leakage:</strong> Lot QR traceability — no bale leaves without barcode dispatch.</li>
                    <li><strong>Fraud Prevention ROI:</strong> Average ₹4.2L/year saved on moisture fraud alone.</li>
                    <li><strong>Transparent Billing:</strong> Regional pricing multipliers for Tirupur, Surat, Ludhiana.</li>
                  </ul>
                </div>
                <div className="metric-card-stack">
                  {[
                    { label: 'Average Waste Reduction', val: '0.85%–1.4%', color: 'var(--emerald)' },
                    { label: 'Invoice Generation Speed', val: '12 Seconds', color: 'var(--sky)' },
                    { label: 'Audit Time Saved', val: '18 Hours/Month', color: 'var(--purple)' },
                    { label: 'Tally Import Speed', val: 'From 4hr → 12s', color: 'var(--amber)' },
                  ].map((m, i) => (
                    <div className="metric-card" key={i}>
                      <span>{m.label}</span>
                      <strong style={{ color: m.color }}>{m.val}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activePersona === 'SPINNER' && (
              <div className="persona-grid">
                <div>
                  <h3>Flawless Bale Inward, Tare Calibration & Waste Balance</h3>
                  <p>From Blowroom to Autoconer — capture tare weights, moisture deductions, staple length. Ensure every 2.5kg cone box has exact net weight with anti-fraud hardware locks.</p>
                  <ul className="check-list">
                    <li><strong>Automated Tare Deductions:</strong> Box tare, tube tare, plastic wrap — calculated at hardware level.</li>
                    <li><strong>Comber Noil & Waste Balance:</strong> Cotton-to-yarn efficiency and drop % by lot.</li>
                    <li><strong>Shift Production Rostering:</strong> 3-shift gate pass, machine uptime & OEE tracking.</li>
                    <li><strong>Machine License Quotas:</strong> Enforce spindle count limits and preventive maintenance schedules.</li>
                  </ul>
                </div>
                <div className="metric-card-stack">
                  {[
                    { label: 'Bale Weighbridge Scan', val: 'RS-232 Automated', color: 'var(--amber)' },
                    { label: 'Cone Box Standard', val: '2.5 kg Tare Calibrated', color: 'var(--emerald)' },
                    { label: 'Moisture Deduction', val: 'SIMA/CCI Standard', color: 'var(--sky)' },
                    { label: 'Lot QR Traceability', val: 'Bale → Cone → Dispatch', color: 'var(--purple)' },
                  ].map((m, i) => (
                    <div className="metric-card" key={i}>
                      <span>{m.label}</span>
                      <strong style={{ color: m.color }}>{m.val}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activePersona === 'AUDIT' && (
              <div className="persona-grid">
                <div>
                  <h3>Book-Ellam (புக் எல்லாம்) — The All-Books Audit Engine</h3>
                  <p>The traditional South Indian textile trade's unified audit research tool. Search all registers simultaneously in one view. Zero manual cross-referencing. Tally Prime auto-vouchers eliminate data re-entry forever.</p>
                  <ul className="check-list">
                    <li><strong>Cross-Register Search:</strong> Day Book, Inward, Outward, Party Khata — one query.</li>
                    <li><strong>Tally XML Auto-Import:</strong> Purchase, sales & receipt vouchers — zero re-entry.</li>
                    <li><strong>CGST/SGST/IGST Auto-Split:</strong> Automated interstate tax categorization.</li>
                    <li><strong>E-Way Bill Integration:</strong> GSTN portal sync for all qualifying dispatches.</li>
                  </ul>
                </div>
                <div className="metric-card-stack">
                  {[
                    { label: 'Tally Import Time', val: '4 Hours → 12 Seconds', color: 'var(--emerald)' },
                    { label: 'GST Error Rate', val: '0% (Auto-Calculated)', color: 'var(--sky)' },
                    { label: 'Audit Preparation', val: '18 Hours Saved/Month', color: 'var(--purple)' },
                    { label: 'E-Way Bill Generation', val: 'API Integrated', color: 'var(--amber)' },
                  ].map((m, i) => (
                    <div className="metric-card" key={i}>
                      <span>{m.label}</span>
                      <strong style={{ color: m.color }}>{m.val}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activePersona === 'DEVOPS' && (
              <div className="persona-grid">
                <div>
                  <h3>1-Click Multi-Cloud Deployment & Zero Vendor Lock-In</h3>
                  <p>A single install command auto-provisions the full EverGreen stack — NestJS API, SQLite database, and Weighbridge agent. Rolling, Blue-Green, and Canary upgrades from provider admin. Full air-gap support for offline factory environments.</p>
                  <ul className="check-list">
                    <li><strong>Hermetic OCI Docker Images:</strong> Tagged, checksummed, and signed artifacts.</li>
                    <li><strong>Zero PII Telemetry:</strong> Only quota metrics sync to provider hub — no business data.</li>
                    <li><strong>Rolling / Blue-Green / Canary:</strong> Zero-downtime upgrades from mission control.</li>
                    <li><strong>Air-Gap Support:</strong> Runs fully offline on local mill LAN with USB provisioning.</li>
                  </ul>
                </div>
                <div className="metric-card-stack">
                  {[
                    { label: 'Deploy Time (Local VM)', val: 'Under 8 Minutes', color: 'var(--emerald)' },
                    { label: 'Upgrade Downtime', val: '0 Seconds (Rolling)', color: 'var(--sky)' },
                    { label: 'Multi-Cloud Support', val: 'GCP · AWS · Azure · VM', color: 'var(--amber)' },
                    { label: 'Data Isolation', val: '100% — Zero Sharing', color: 'var(--purple)' },
                  ].map((m, i) => (
                    <div className="metric-card" key={i}>
                      <span>{m.label}</span>
                      <strong style={{ color: m.color }}>{m.val}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="mkt-section bg-alt">
        <div className="mkt-container">
          <div className="section-head">
            <span className="eyebrow">CORE CAPABILITIES</span>
            <h2>Every Feature Your Mill Needs — Nothing It Doesn't</h2>
            <p>Six pillars of textile intelligence, engineered for the reality of South Asian manufacturing.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div className={`feature-card glass-card feature-${f.color}`} key={i}>
                <div className="feature-icon-row">
                  <span className="feature-icon">{f.icon}</span>
                  <span className={`feature-tag tag-${f.color}`}>{f.tag}</span>
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
                <ul className="feature-items">
                  {f.items.map((item, j) => (
                    <li key={j}><span className={`item-dot dot-${f.color}`} />{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MILL SAVINGS & YARN REALIZATION MATRIX CALCULATOR ── */}
      <section id="calculator" className="mkt-section">
        <div className="mkt-container">
          <div className="section-head">
            <span className="eyebrow">{t.sections.calculatorEyebrow}</span>
            <h2>{t.sections.calculatorTitle}</h2>
            <p>{t.sections.calculatorSubtitle}</p>
          </div>
          <YarnRealizationCalculator onStartPoc={() => setShowPocModal(true)} lang={lang} />
        </div>
      </section>

      {/* ── WEIGHBRIDGE HARDWARE COMPATIBILITY MATRIX ── */}
      <section id="hardware" className="mkt-section bg-alt">
        <div className="mkt-container">
          <div className="section-head">
            <span className="eyebrow">{t.sections.hardwareEyebrow}</span>
            <h2>{t.sections.hardwareTitle}</h2>
            <p>{t.sections.hardwareSubtitle}</p>
          </div>
          <WeighbridgeHardwareMatrix onStartPoc={() => setShowPocModal(true)} lang={lang} />
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="mkt-section bg-alt"><div className="mkt-container product-readiness-note">Illustrative plan options. Confirm commercial terms, quotas and support in writing before purchase.</div>
        <div className="mkt-container">
          <div className="section-head">
            <span className="eyebrow">{t.sections.pricingEyebrow}</span>
            <h2>{t.sections.pricingTitle}</h2>
            <p>{t.sections.pricingSubtitle}</p>
          </div>

          <div className="pricing-cycle-toggle">
            <button className={`cycle-btn ${pricingCycle === 'monthly' ? 'active' : ''}`} onClick={() => setPricingCycle('monthly')}>Monthly</button>
            <button className={`cycle-btn ${pricingCycle === 'annual' ? 'active' : ''}`} onClick={() => setPricingCycle('annual')}>
              Annual <span className="save-badge">Save 20%</span>
            </button>
          </div>

          <div className="pricing-grid">
            {TIERS.map((tier, i) => {
              // Currency logic
              const isUsd = currency === 'USD';
              const usdMonthly = tier.price === 3999 ? 49 : tier.price === 7999 ? 99 : tier.price === 14999 ? 189 : 0;
              const usdAnnual = tier.price === 3999 ? 39 : tier.price === 7999 ? 79 : tier.price === 14999 ? 149 : 0;

              return (
                <div className={`pricing-card glass-card ${tier.popular ? 'popular' : ''} tier-${tier.color}`} key={i}>
                  {tier.popular && <div className="popular-badge">⭐ MOST POPULAR</div>}
                  <div className="tier-badge-row">
                    <span className={`tier-badge badge-${tier.color}`}>{tier.badge}</span>
                  </div>
                  <h3 className="tier-name">{tier.name}</h3>
                  <div className="tier-price">
                    {tier.price === 0 ? (
                      isUsd ? (
                        <><span className="price-val">$0.15</span><span className="price-period">/bale inward</span></>
                      ) : (
                        <><span className="price-val">₹12</span><span className="price-period">/bale inward</span></>
                      )
                    ) : isUsd ? (
                      <>
                        <span className="price-val">${pricingCycle === 'annual' ? usdAnnual : usdMonthly}</span>
                        <span className="price-period">/month</span>
                      </>
                    ) : (
                      <>
                        <span className="price-val">₹{pricingCycle === 'annual' ? Math.round(tier.price * 0.8).toLocaleString() : tier.price.toLocaleString()}</span>
                        <span className="price-period">/month</span>
                      </>
                    )}
                    {pricingCycle === 'annual' && tier.price > 0 && (
                      <div className="price-annual-note">
                        {isUsd
                          ? `Billed $${usdAnnual * 12}/year (20% off)`
                          : `Billed ₹${Math.round(tier.price * 0.8 * 12).toLocaleString()}/year`}
                      </div>
                    )}
                  </div>
                  <p className="tier-desc">{tier.desc}</p>
                  <ul className="tier-features">
                    {tier.features.map((f, j) => (
                      <li key={j}><span className={`check-icon check-${tier.color}`}>✓</span>{f}</li>
                    ))}
                  </ul>
                  <button
                    className={`tier-cta ${tier.popular ? 'btn-primary' : 'btn-ghost-color'} btn-cta-color-${tier.color}`}
                    onClick={() => setShowPocModal(true)}
                  >
                    {tier.cta}
                  </button>
                </div>
              );
            })}
          </div>

          {/* GRACE POLICY CARD */}
          <div className="grace-card glass-card" id="grace-policy">
            <div className="grace-icon">🛡️</div>
            <div className="grace-content">
              <h3>{t.grace.title}</h3>
              <p>{t.grace.desc}</p>
            </div>
            <div className="grace-timeline">
              {[
                { d: 'Day 0', label: lang === 'ta' ? 'உரிம காலம் முடிகிறது' : 'License Expires', icon: '📅', color: 'var(--amber)' },
                { d: 'Day 1–7', label: lang === 'ta' ? 'உதவி குழு தொடர்பு' : 'Support Team Contacts', icon: '📞', color: 'var(--sky)' },
                { d: 'Day 7–30', label: lang === 'ta' ? 'சலுகை இயக்கம் தொடரும்' : 'Grace Operations Continue', icon: '✅', color: 'var(--emerald)' },
                { d: '< 3 Min', label: lang === 'ta' ? 'UTR மூலம் உடனடி மீட்பு' : 'Instant Reactivation on UTR', icon: '⚡', color: 'var(--emerald)' },
              ].map((g, i) => (
                <div className="grace-step" key={i}>
                  <div className="grace-step-icon" style={{ borderColor: g.color }}>{g.icon}</div>
                  <div className="grace-step-day" style={{ color: g.color }}>{g.d}</div>
                  <div className="grace-step-label">{g.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── INTEGRATIONS ── */}
      <section id="integrations" className="mkt-section"><div className="mkt-container product-readiness-note">Integration directory: these are planned connector profiles and illustrative payloads. Tally XML export is available in the app; live posting, payment providers and regional compliance require separate configuration and validation.</div>
        <div className="mkt-container">
          <div className="section-head">
            <span className="eyebrow">ECOSYSTEM & HARDWARE CONNECTORS</span>
            <h2>Integrates With Your Existing Software, Cloud & Hardware</h2>
            <p>EverGreen plugs into the tools your spinning mill already uses — weighbridge hardware, Indian & global payments, accounting, multi-cloud, and AI engines.</p>
          </div>

          <div style={{ maxWidth: 480, margin: '0 auto 1.5rem', position: 'relative' }}>
            <input
              type="text"
              placeholder="🔍 Search 28+ connectors (Razorpay, PhonePe, Tally, Avery, AWS, Claude, Zoho...)"
              value={integSearch}
              onChange={e => setIntegSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1.25rem',
                borderRadius: 9999,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>

          <div className="integ-filter">
            {integCategories.map(c => (
              <button key={c} className={`integ-filter-btn ${activeIntegCategory === c ? 'active' : ''}`}
                onClick={() => setActiveIntegCategory(c)}>
                {c} {c === 'All' ? `(${INTEGRATIONS.length})` : ''}
              </button>
            ))}
          </div>

          <div className="integ-grid">
            {filteredIntegs.map((integ, i) => (
              <div className="integ-card glass-card" key={i} onClick={() => setSelectedInteg(integ)}>
                <div className="integ-logo">{integ.logo}</div>
                <div className="integ-info">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
                    <div className="integ-name">{integ.name}</div>
                    <span className="integ-latency">Setup required</span>
                  </div>
                  <div className="integ-desc">{integ.desc}</div>
                  <div className="integ-badge-row">
                    <span className={`integ-status-badge ${integ.status === 'CERTIFIED' ? 'certified' : integ.status === 'PLUG_AND_PLAY' ? 'plug' : 'configurable'}`}>
                      {integ.status.replace(/_/g, ' ')}
                    </span>
                    <span className="integ-category">{integ.category}</span>
                  </div>
                  <div className="integ-inspect-hint">Inspect illustrative payload ↗</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEPLOYMENT TERMINAL ── */}
      <section id="deployment" className="mkt-section bg-alt"><div className="mkt-container product-readiness-note">Deployment examples show the intended workflow. A cloud account, domain, secrets and environment validation are required; this page does not provision infrastructure.</div>
        <div className="mkt-container">
          <div className="section-head">
            <span className="eyebrow">1-CLICK DEPLOYMENT</span>
            <h2>Deploy in Under 8 Minutes — Any Cloud, Any Mill</h2>
            <p>A single command installs the complete EverGreen stack. Choose your deployment target and copy the script.</p>
          </div>
          <div className="terminal-card glass-card">
            <div className="terminal-header">
              <div className="terminal-dots">
                <span /><span /><span />
              </div>
              <span className="terminal-title">EverGreen Install Terminal</span>
              <div className="terminal-target-selector">
                {(['LOCAL_VM', 'GCP', 'AWS', 'AZURE'] as const).map(t => (
                  <button
                    key={t}
                    className={`terminal-target-btn ${deployTarget === t ? 'active' : ''}`}
                    onClick={() => setDeployTarget(t)}
                  >
                    {t === 'LOCAL_VM' ? '🖥️ Local VM' : t === 'GCP' ? '☁️ GCP' : t === 'AWS' ? '🟠 AWS' : '🔵 Azure'}
                  </button>
                ))}
              </div>
            </div>
            <div className="terminal-body">
              <div className="terminal-comment"># EverGreen OS — {deployTarget} Single-Command Install</div>
              {deployTarget === 'LOCAL_VM' && (
                <>
                  <div className="terminal-line"><span className="t-prompt">$</span> curl -sSL https://get.evergreenos.in/install.sh | sudo bash -s -- \</div>
                  <div className="terminal-line t-indent"><span className="t-flag">--target</span>=local-vm <span className="t-flag">--port</span>=4000 <span className="t-flag">--admin-url</span>=https://admin.evergreenos.in</div>
                </>
              )}
              {deployTarget === 'GCP' && (
                <>
                  <div className="terminal-line"><span className="t-prompt">$</span> gcloud run deploy <span className="t-str">evergreen-mill</span> \</div>
                  <div className="terminal-line t-indent"><span className="t-flag">--image</span>=<span className="t-str">gcr.io/evergreen-os/tenant:v1.2.4-lts</span> \</div>
                  <div className="terminal-line t-indent"><span className="t-flag">--region</span>=asia-south1 <span className="t-flag">--allow-unauthenticated</span></div>
                </>
              )}
              {deployTarget === 'AWS' && (
                <>
                  <div className="terminal-line"><span className="t-prompt">$</span> aws ecs create-service <span className="t-flag">--cluster</span> evergreen \</div>
                  <div className="terminal-line t-indent"><span className="t-flag">--service-name</span> mill <span className="t-flag">--task-definition</span> evergreen:v1.2.4 \</div>
                  <div className="terminal-line t-indent"><span className="t-flag">--desired-count</span> 1 <span className="t-flag">--launch-type</span> FARGATE</div>
                </>
              )}
              {deployTarget === 'AZURE' && (
                <>
                  <div className="terminal-line"><span className="t-prompt">$</span> az container create <span className="t-flag">--resource-group</span> EvergreenRG \</div>
                  <div className="terminal-line t-indent"><span className="t-flag">--name</span> mill-tenant <span className="t-flag">--image</span> <span className="t-str">evergreenos/tenant:v1.2.4-lts</span> \</div>
                  <div className="terminal-line t-indent"><span className="t-flag">--cpu</span> 2 <span className="t-flag">--memory</span> 4 <span className="t-flag">--ports</span> 4000 4301</div>
                </>
              )}
              <div className="terminal-line t-success">✓ EverGreen deployed successfully. Visit http://localhost:4000</div>
            </div>
            <div className="terminal-footer">
              <button className="btn-copy" onClick={copyScript}>{copied ? '✅ Copied!' : '📋 Copy Command'}</button>
              <span className="terminal-note">Estimated setup time: 6–8 minutes including Docker pull</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CASE STUDIES ── */}
      <section id="case-studies" className="mkt-section">
        <div className="mkt-container">
          <div className="section-head">
            <span className="eyebrow">{t.sections.caseStudiesEyebrow}</span>
            <h2>{t.sections.caseStudiesTitle}</h2>
            <p>{t.sections.caseStudiesSubtitle}</p>
          </div>
          <InteractiveCaseStudies onStartPoc={() => setShowPocModal(true)} lang={lang} />
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="mkt-section bg-alt">
        <div className="mkt-container">
          <div className="section-head">
            <span className="eyebrow">{t.sections.faqEyebrow}</span>
            <h2>{t.sections.faqTitle}</h2>
            <p>{lang === 'ta' ? 'உங்கள் ஆலைக்கான சந்தேகங்களை உடனே தீர்த்துக் கொள்ளுங்கள்' : 'Direct answers to architectural, operational, and commercial questions.'}</p>
          </div>

          <div style={{ maxWidth: 540, margin: '0 auto 1.25rem' }}>
            <input
              type="text"
              placeholder={lang === 'ta' ? '🔍 கேள்விகளைத் தேடுங்கள் (எடைமேடை, டாலி, 30 நாள் சலுகை...)' : '🔍 Search FAQs (weighbridge, Tally, 30-day grace, pricing, offline...)'}
              value={faqQuery}
              onChange={e => setFaqQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1.25rem',
                borderRadius: 9999,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                color: '#fff',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>

          <div className="integ-filter" style={{ marginBottom: '2rem' }}>
            {['All', 'Weighbridge & Hardware', 'Accounting & Tally', '30-Day Grace & Licensing', 'Cloud & Offline', 'Book-Ellam', 'Pricing & Plans'].map(cat => (
              <button
                key={cat}
                className={`integ-filter-btn ${faqCategory === cat ? 'active' : ''}`}
                onClick={() => setFaqCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="faq-list">
            {filteredFaqs.length === 0 ? (
              <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>No matching questions found for "{faqQuery}".</p>
                <a
                  href="https://wa.me/919842755200?text=Hello%20EverGreen%20Team%2C%20I%20have%20a%20specific%20question%20about%20your%20ERP"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  💬 Ask Our Textile Engineers on WhatsApp
                </a>
              </div>
            ) : (
              filteredFaqs.map((faq, i) => (
                <div className={`faq-item glass-card ${activeFaq === i ? 'open' : ''}`} key={i} onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                  <div className="faq-q">
                    <span>{faq.q}</span>
                    <span className="faq-chevron">{activeFaq === i ? '▲' : '▼'}</span>
                  </div>
                  {activeFaq === i && <div className="faq-a">{faq.a}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── SUPPORT ── */}
      <section id="support" className="mkt-section">
        <div className="mkt-container">
          <div className="section-head">
            <span className="eyebrow">SUPPORT & CUSTOMER SUCCESS</span>
            <h2>Plan your rollout with the right support</h2>
            <p>South India-based team. Tamil & English support. Engineers who understand spinning mills — not just software.</p>
          </div>
          <div className="support-grid">
            {SUPPORT_CHANNELS.map((s, i) => (
              <div className={`support-card glass-card support-${s.color}`} key={i}>
                <div className="support-icon">{s.icon}</div>
                <h4 className="support-title">{s.title}</h4>
                <p className="support-desc">{s.desc}</p>
                <div className="support-detail">{s.detail}</div>
                <button className={`support-cta btn-support-${s.color}`} onClick={() => setShowPocModal(true)}>{s.cta}</button>
              </div>
            ))}
          </div>

          <div id="scout"><AiAssistant endpoint={(import.meta.env.VITE_MARKETING_API_URL || '/marketing-api') + '/ai/marketing'} title="Scout" purpose="Explore EverGreen and prepare your product demo" prompts={['Is EverGreen suitable for my textile business?', 'What is ready today and what needs configuration?', 'Help me prepare a demo checklist.']} /></div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="mkt-section bg-alt">
        <div className="mkt-container">
          <div className="section-head">
            <span className="eyebrow">CONTACT US</span>
            <h2>Talk to a Textile ERP Expert</h2>
            <p>Schedule a demo, get a custom quote, or ask us anything about your mill's requirements.</p>
          </div>
          <div className="contact-grid">
            <div className="contact-info glass-card">
              <h3>Get in Touch</h3>
              <div className="contact-items">
                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  <div>
                    <div className="contact-label">Phone & WhatsApp</div>
                    <div className="contact-val">+91 98427 55200 / +91 94431 88300</div>
                  </div>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">✉️</span>
                  <div>
                    <div className="contact-label">Email</div>
                    <div className="contact-val">sales@evergreen-os.com · support@evergreen-os.com</div>
                  </div>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">🏢</span>
                  <div>
                    <div className="contact-label">Head Office & Innovation Lab</div>
                    <div className="contact-val">Evergreen Technology Tower, Avinashi Road, Civil Aerodrome Post, Coimbatore — 641014</div>
                  </div>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">🌐</span>
                  <div>
                    <div className="contact-label">Service & Regional Nodes</div>
                    <div className="contact-val">Tirupur · Coimbatore · Karur · Erode · Gujarat · Pan-India</div>
                  </div>
                </div>
              </div>

              <div className="office-hubs-grid">
                <div className="office-hub-card">
                  <div className="office-hub-title">📍 Coimbatore HQ</div>
                  <div className="office-hub-desc">Central Architecture, R&D & Multi-Cloud Ops</div>
                </div>
                <div className="office-hub-card">
                  <div className="office-hub-title">🧵 Tirupur Hub</div>
                  <div className="office-hub-desc">42 Kumaran Rd · Weighbridge Field Engineering</div>
                </div>
                <div className="office-hub-card">
                  <div className="office-hub-title">🧶 Karur Desk</div>
                  <div className="office-hub-desc">15 Kovai Rd · Yarn Trading & Handloom Desk</div>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <a
                  href="https://wa.me/919842755200?text=Hello%20EverGreen%20Team%2C%20I%20would%20like%20a%20demo%20for%20my%20spinning%20mill"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-whatsapp-pill"
                >
                  💬 Chat on WhatsApp with Textile Specialist →
                </a>
              </div>

              <div className="office-hours" style={{ marginTop: '1.25rem' }}>
                <strong>Support arrangements</strong>
                <span>Mon–Sat: 8:00 AM – 9:00 PM IST · &lt; 30 min SLA</span>
                <span>Use a verified support contact for urgent operational issues.</span>
              </div>
            </div>

            <div className="contact-form-card glass-card">
              {contactSent ? (
                <div className="contact-success">
                  <div className="contact-success-icon">✅</div>
                  <h3>Enquiry draft prepared</h3>
                  <p>Your enquiry was downloaded as a text file. This site has no connected enquiry-delivery service. Share the draft through a verified business contact when ready.</p>
                </div>
              ) : (
                <form className="contact-form" onSubmit={e => {
                  e.preventDefault();
                  downloadEnquiry('evergreen-enquiry', contactForm);
                  setContactSent(true);
                  setToastMsg('Enquiry draft downloaded. It has not been sent to a support team.');
                }}>
                  <h3>Talk to an Engineer</h3>
                  <div className="cf-row-2">
                    <div className="cf-field">
                      <label>Your Name *</label>
                      <input required placeholder="M. Selvakumar" value={contactForm.name} onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className="cf-field">
                      <label>Phone / WhatsApp *</label>
                      <input required placeholder="+91 98427 55200" value={contactForm.phone} onChange={e => setContactForm(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                  </div>
                  <div className="cf-row-2">
                    <div className="cf-field">
                      <label>Company / Mill Name</label>
                      <input placeholder="Sri Murugan Spinning Mills" value={contactForm.company} onChange={e => setContactForm(p => ({ ...p, company: e.target.value }))} />
                    </div>
                    <div className="cf-field">
                      <label>Enquiry Type</label>
                      <select value={contactForm.type} onChange={e => setContactForm(p => ({ ...p, type: e.target.value }))}>
                        <option>Sales & Free POC Request</option>
                        <option>Weighbridge Hardware Integration</option>
                        <option>Tally Prime XML Bridge Setup</option>
                        <option>Multi-Cloud Hosting & Migration</option>
                        <option>Pricing & Annual License</option>
                      </select>
                    </div>
                  </div>
                  <div className="cf-field">
                    <label>Email</label>
                    <input type="email" placeholder="owner@mill.com" value={contactForm.email} onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="cf-field">
                    <label>Message *</label>
                    <textarea required rows={4} placeholder="Tell us about your mill — number of spindles, weighbridge indicators, current pain points..." value={contactForm.message} onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))} />
                  </div>
                  <button type="submit" className="btn-primary btn-full">Send Message →</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="final-cta-section">
        <div className="mkt-container">
          <div className="final-cta-card glass-card">
            <div className="final-cta-glow" />
            <h2 className="final-cta-h2">Ready to Transform Your Spinning Mill?</h2>
            <p className="final-cta-p">
              Join leading mills across Tirupur, Coimbatore, Erode & Karur who have eliminated weighbridge moisture fraud,
              automated Tally entry, and unlocked real-time shift profit visibility with EverGreen OS.
            </p>
            <div className="final-cta-btns">
              <button className="btn-primary btn-xl" onClick={() => setShowPocModal(true)}>
                🚀 Start Free 30-Day POC
              </button>
              <a
                href="https://wa.me/919842755200?text=Hello%20EverGreen%20Team%2C%20I%20want%20to%20schedule%20a%20POC%20for%20my%20spinning%20mill"
                target="_blank"
                rel="noreferrer"
                className="btn-ghost btn-xl"
              >
                💬 WhatsApp Schedule →
              </a>
            </div>
            <div className="final-trust">
              <span>✓ No credit card required</span>
              <span>✓ Real mill data & weighbridge test</span>
              <span>✓ 30-Day Grace safeguard on all plans</span>
              <span>✓ Dedicated field engineer on-site</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="mkt-footer">
        <div className="mkt-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <svg viewBox="0 0 40 40" fill="none" className="footer-logo-svg">
                <rect width="40" height="40" rx="11" fill="#0a1120" />
                <path d="M20 6L34 15V25L20 34L6 25V15L20 6Z" stroke="#10b981" strokeWidth="2" strokeLinejoin="round" />
                <circle cx="20" cy="20" r="5" fill="#38bdf8" />
              </svg>
              <div className="footer-brand-name">EverGreen OS</div>
              <p className="footer-brand-desc">The Intelligent Textile & Yarn ERP Operating System for modern spinning mills.</p>
              <div className="footer-socials">
                <a href="#" className="footer-social">𝕏</a>
                <a href="#" className="footer-social">in</a>
                <a href="#" className="footer-social">YT</a>
              </div>
            </div>
            <div className="footer-links-col">
              <h4>Platform</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#integrations">Integrations</a>
              <a href="#deployment">Deployment</a>
            </div>
            <div className="footer-links-col">
              <h4>Industries</h4>
              <a href="#">Ring Spinning Mills</a>
              <a href="#">OE Rotor Spinning</a>
              <a href="#">Cotton Ginning</a>
              <a href="#">Yarn Traders</a>
              <a href="#">Composite Mills</a>
            </div>
            <div className="footer-links-col">
              <h4>Resources</h4>
              <a href="#">Documentation</a>
              <a href="#">API Reference</a>
              <a href="#">Case Studies</a>
              <a href="#">System Status</a>
              <a href="#">Changelog</a>
            </div>
            <div className="footer-links-col">
              <h4>Company</h4>
              <a href="#contact">Contact Sales</a>
              <a href="#support">Support</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">SLA Agreement</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Evergreen Textile Technologies Private Limited. All rights reserved.</span>
            <span>Built with ❤️ in Tamil Nadu, India · Serving textile mills worldwide</span>
          </div>
        </div>
      </footer>

      {/* ── CONNECTOR INSPECTOR MODAL ── */}
      {selectedInteg && (
        <div className="modal-backdrop" onClick={() => setSelectedInteg(null)}>
          <div className="modal-box glass-card integ-modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedInteg(null)}>✕</button>
            <div className="integ-modal-header">
              <div className="integ-modal-logo">{selectedInteg.logo}</div>
              <div className="integ-modal-meta">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h3>{selectedInteg.name}</h3>
                  <span className={`integ-status-badge ${selectedInteg.status === 'CERTIFIED' ? 'certified' : selectedInteg.status === 'PLUG_AND_PLAY' ? 'plug' : 'configurable'}`}>
                    {selectedInteg.status}
                  </span>
                </div>
                <p>{selectedInteg.desc}</p>
              </div>
            </div>

            <div className="integ-modal-body">
              <div className="integ-modal-grid">
                <div className="integ-modal-field">
                  <div className="integ-modal-label">Category</div>
                  <div className="integ-modal-val">{selectedInteg.category}</div>
                </div>
                <div className="integ-modal-field">
                  <div className="integ-modal-label">Connection readiness</div>
                  <div className="integ-modal-val" style={{ color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--emerald)' }} />
                    Not measured - planned connector
                  </div>
                </div>
              </div>

              <div className="integ-modal-field">
                <div className="integ-modal-label">Integration Protocol & Transport</div>
                <div className="integ-modal-val" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--sky)' }}>
                  {selectedInteg.protocol}
                </div>
              </div>

              <div>
                <div className="integ-modal-label" style={{ marginBottom: '0.4rem' }}>Supported Events & Telemetry</div>
                <div className="integ-events-pillbox">
                  {selectedInteg.supportedEvents.map((evt, idx) => (
                    <span key={idx} className="integ-event-pill">⚡ {evt}</span>
                  ))}
                </div>
              </div>

              <div>
                <div className="integ-modal-label" style={{ marginBottom: '0.4rem' }}>Sample Production Payload / Command</div>
                <pre className="integ-snippet-box">{selectedInteg.snippet}</pre>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button className="btn-ghost" onClick={() => setSelectedInteg(null)}>Close</button>
                <button className="btn-primary" onClick={() => { setSelectedInteg(null); setShowPocModal(true); }}>
                  Configure for My Mill →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FLOATING WHATSAPP CTA ── */}
      <a
        href="https://wa.me/919842755200?text=Hello%20EverGreen%20Team%2C%20I%20would%20like%20to%20learn%20more%20about%20EverGreen%20OS%20for%20my%20spinning%20mill"
        target="_blank"
        rel="noreferrer"
        className="floating-whatsapp"
        title="Chat with EverGreen Support"
      >
        <span>💬</span>
        <span>WhatsApp +91 98427 55200</span>
      </a>

      {/* ── POC MODAL ── */}
      {showPocModal && (
        <div className="modal-backdrop" onClick={() => setShowPocModal(false)}>
          <div className="modal-box glass-card" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowPocModal(false)}>✕</button>
            {pocSubmitted ? (
              <div className="poc-success">
                <div className="poc-success-icon">🎉</div>
                <h3>Demo request prepared</h3>
                <p>Your demo request was downloaded for you to review. No message has been sent and no appointment or deployment has been booked.</p>
                <button className="btn-primary" onClick={() => { setShowPocModal(false); setPocSubmitted(false); }}>Done</button>
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <h3>🚀 Prepare your product demo</h3>
                  <p>Describe your mill and the workflows you want to evaluate. Download a request draft and confirm demo arrangements with your business contact.</p>
                </div>
                <form className="poc-form" onSubmit={e => {
                  e.preventDefault();
                  downloadEnquiry('evergreen-demo-request', pocForm);
                  setPocSubmitted(true);
                  setToastMsg('Demo request draft downloaded. No booking or deployment has been made.');
                }}>
                  <div className="cf-row-2">
                    <div className="cf-field">
                      <label>Your Name *</label>
                      <input required value={pocForm.name} onChange={e => setPocForm(p => ({ ...p, name: e.target.value }))} placeholder="M. Selvakumar" />
                    </div>
                    <div className="cf-field">
                      <label>WhatsApp / Phone *</label>
                      <input required value={pocForm.phone} onChange={e => setPocForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98427 55200" />
                    </div>
                  </div>
                  <div className="cf-row-2">
                    <div className="cf-field">
                      <label>Mill Name *</label>
                      <input required value={pocForm.company} onChange={e => setPocForm(p => ({ ...p, company: e.target.value }))} placeholder="Sri Murugan Spinning Mills" />
                    </div>
                    <div className="cf-field">
                      <label>City / District</label>
                      <input value={pocForm.city} onChange={e => setPocForm(p => ({ ...p, city: e.target.value }))} placeholder="Tirupur, Tamil Nadu" />
                    </div>
                  </div>
                  <div className="cf-row-2">
                    <div className="cf-field">
                      <label>Mill Operation Type</label>
                      <select
                        value={pocForm.millType}
                        onChange={e => setPocForm(p => ({ ...p, millType: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.9rem',
                          borderRadius: 8,
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--border)',
                          color: '#fff',
                          fontSize: '0.85rem',
                        }}
                      >
                        <option value="Ring Spinning Mill">Ring Spinning (10k–60k Spindles)</option>
                        <option value="OE Rotor Spinning">Open End (OE) Rotor Spinning</option>
                        <option value="Cotton Ginning Unit">Cotton Ginning & Pressing</option>
                        <option value="Yarn Trading Desk">Yarn Trading & Export Broker</option>
                        <option value="Composite Mill">Composite Mill (Spinning + Weaving)</option>
                      </select>
                    </div>
                    <div className="cf-field">
                      <label>Number of Spindles / Rotors</label>
                      <input value={pocForm.spindles} onChange={e => setPocForm(p => ({ ...p, spindles: e.target.value }))} placeholder="e.g. 18,000" />
                    </div>
                  </div>
                  <div className="cf-field">
                    <label>Current Challenge / Hardware Setup</label>
                    <textarea rows={3} value={pocForm.message} onChange={e => setPocForm(p => ({ ...p, message: e.target.value }))} placeholder="e.g. Avery weighbridge indicator, manual Tally entry, need moisture fraud protection..." />
                  </div>
                  <button type="submit" className="btn-primary btn-full">Submit POC Request →</button>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'center', marginTop: '0.75rem' }}>
                    We respond within 2 hours. WhatsApp +91 98427 55200 for instant commissioning scheduling.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── INTERACTIVE 5-STEP TOUR MODAL ── */}
      <ProductTourModal
        isOpen={showTourModal}
        onClose={() => setShowTourModal(false)}
        onStartPoc={() => setShowPocModal(true)}
        lang={lang}
      />

      {/* ── FLOATING TOAST FEEDBACK ── */}
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
    </div>
  );
}
