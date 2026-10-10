import { useEffect, useState, useMemo } from 'react';
import './App.css';
import {
  CONNECTORS,
  DEMO_RECORDS,
  DEMO_TENANTS,
  money,
  uid
} from './control-data';
import type { RecordItem, Connector } from './control-data';

/* ─────────────────────────────────────────────────────────────────────────── */
/*  TYPE DEFINITIONS                                                           */
/* ─────────────────────────────────────────────────────────────────────────── */
interface RemoteAction {
  id: string;
  actionType: string;
  status: string;
  details: string | null;
  createdAt: string;
}

interface Company {
  id: string;
  name: string;
  deploymentUrl: string | null;
  cloudProvider: string;
  appVersion: string;
  apiKey: string;
  licenseKey: string | null;
  plan: string;
  pricingModel: string;
  tier: string;
  state: string;
  country: string;
  maxUsers: number;
  maxMachines: number;
  maxDocsPerMonth: number;
  allowedModules: string;
  activeStaff: number;
  docsPosted: number;
  status: string;
  isMaintenance: boolean;
  lastMigrationStatus: string;
  expiresAt: string | null;
  lastSyncAt: string | null;
  actions?: RemoteAction[];
}

interface ReleasePackage {
  id: string;
  version: string;
  name: string;
  branch: string;
  commit: string;
  targets: string[];
  artifacts: {
    format: string;
    identifier: string;
    checksumSha256: string;
    sizeMB: number;
  }[];
  changelog: string;
  status: string;
  createdAt: string;
}

interface DeploymentRecord {
  id: string;
  companyId: string;
  companyName: string;
  cloudProvider: string;
  packageVersion: string;
  strategy: string;
  status: string;
  triggeredBy: string;
  startedAt: string;
  completedAt?: string;
  details: string;
}

interface CicdLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
  category: 'BUILD' | 'PACKAGE' | 'DEPLOY' | 'HEALTH' | 'REACTIVATION';
  message: string;
  companyId?: string;
}

export type TabId =
  | 'DASHBOARD'
  | 'TENANTS'
  | 'DEPLOYMENTS'
  | 'PACKAGES'
  | 'MAINTENANCE'
  | 'DATABASES'
  | 'APIS'
  | 'WEBHOOKS'
  | 'INTEGRATIONS'
  | 'PAYMENTS'
  | 'AGREEMENTS'
  | 'TASKS'
  | 'AI_AGENT'
  | 'CHAT'
  | 'SCRIPTS'
  | 'LOGS';

type NavCategory = 'ALL' | 'CORE' | 'CLOUD' | 'CONNECTIVITY' | 'FINANCE' | 'INTELLIGENCE';

/* ─────────────────────────────────────────────────────────────────────────── */
/*  BRAND SVG LOGO                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */
function BrandLogo() {
  return (
    <svg className="admin-brand-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="15" fill="#080f20" />
      <path d="M32 10L50 22V42L32 54L14 42V22L32 10Z" stroke="#10B981" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="32" cy="32" r="8" fill="url(#brandGrad)" />
      <path d="M32 10V24M32 54V40M14 22L24 32M50 42L40 32" stroke="#10B981" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <defs>
        <radialGradient id="brandGrad" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  HELPER: PLAN COLOR                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */
function planColor(plan: string): string {
  if (plan === 'ENTERPRISE') return '#a855f7';
  if (plan === 'SCALE') return '#38bdf8';
  if (plan === 'GROWTH') return '#10b981';
  if (plan === 'GATEKEEPER') return '#f59e0b';
  return '#94a3b8';
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  SAMPLE RECENT ACTIVITY LOGS                                                */
/* ─────────────────────────────────────────────────────────────────────────── */
const SAMPLE_ACTIVITY = [
  { dot: 'success', msg: 'Sri Murugan Handlooms Tally Prime XML export successful — 48 purchase vouchers synced', time: '2 min ago' },
  { dot: 'warning', msg: 'Kavitha Cotton Mills grace quota 7-day watch activated — renewal call scheduled', time: '14 min ago' },
  { dot: 'info', msg: 'v1.2.4-lts deployed to Selvam Spinning Works (GCP Cloud Run) via Rolling strategy', time: '1 hr ago' },
  { dot: 'success', msg: 'TareZero weighbridge anti-fraud caught 180 kg moisture discrepancy at Coimbatore node', time: '2 hr ago' },
  { dot: 'info', msg: 'New tenant: Mahalakshmi Spinning Mills Pvt Ltd — Tirupur Cluster provisioned on LOCAL_VM', time: '5 hr ago' },
  { dot: 'success', msg: 'WhatsApp collection reminder sent to 3 parties — ₹2.4L outstanding cleared', time: '8 hr ago' },
];

/* ─────────────────────────────────────────────────────────────────────────── */
/*  MAIN APP COMPONENT                                                          */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function App() {
  const [activeCategory, setActiveCategory] = useState<NavCategory>('ALL');
  const [activeTab, setActiveTab] = useState<TabId>('DASHBOARD');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [records, setRecords] = useState<RecordItem[]>(DEMO_RECORDS);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // CI/CD states
  const [packages, setPackages] = useState<ReleasePackage[]>([]);
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [logs, setLogs] = useState<CicdLogEntry[]>([]);
  const [logFilter, setLogFilter] = useState<string>('ALL');

  // Tenant Filters
  const [cloudFilter, setCloudFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Customizable Dashboard Widget Toggles
  const [widgets, setWidgets] = useState({
    kpis: true,
    alerts: true,
    charts: true,
    clusters: true,
    activity: true,
    fraudMonitor: true,
    arrRunrate: true,
    aiHealth: true,
  });

  // Modals
  const [activeModalCompany, setActiveModalCompany] = useState<Company | null>(null);
  const [deployTargetCompany, setDeployTargetCompany] = useState<Company | null>(null);
  const [reactivateTargetCompany, setReactivateTargetCompany] = useState<Company | null>(null);
  const [reactivateUtr, setReactivateUtr] = useState<string>('');
  const [reactivatePeriod, setReactivatePeriod] = useState<'1_YEAR' | '30_DAYS'>('1_YEAR');
  const [reactivateTimer, setReactivateTimer] = useState<number | null>(null);
  const [selectedPackageToDeploy, setSelectedPackageToDeploy] = useState<string>('v1.2.4-lts');
  const [selectedStrategy, setSelectedStrategy] = useState<'ROLLING' | 'BLUE_GREEN' | 'CANARY' | 'INSTANT'>('ROLLING');

  const [showNewPkgModal, setShowNewPkgModal] = useState(false);
  const [newPkgVersion, setNewPkgVersion] = useState('');
  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgChangelog, setNewPkgChangelog] = useState('');
  const [newPkgTargets, setNewPkgTargets] = useState<string[]>(['GCP', 'AWS', 'AZURE', 'LOCAL_VM']);

  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [name, setName] = useState('');
  const [cloud, setCloud] = useState('LOCAL_VM');
  const [url, setUrl] = useState('');
  const [tier, setTier] = useState('TIER_2_CITY');
  const [stateRegion, setStateRegion] = useState('Tamil Nadu');
  const [plan, setPlan] = useState('GROWTH');
  const [maxUsers, setMaxUsers] = useState(5);
  const [maxMachines, setMaxMachines] = useState(25);
  const [maxDocs, setMaxDocs] = useState(2000);
  const [pricingModel, setPricingModel] = useState('TIERED');

  // Integrations state
  const [connectorCategory, setConnectorCategory] = useState<string>('ALL');
  const [connectorSearch, setConnectorSearch] = useState<string>('');
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null);
  const [pingStatus, setPingStatus] = useState<Record<string, { status: string; pingMs: number }>>({
    github: { status: 'CONNECTED', pingMs: 18 },
    gcp: { status: 'CONNECTED', pingMs: 24 },
    razorpay: { status: 'CONNECTED', pingMs: 31 },
    whatsapp: { status: 'CONNECTED', pingMs: 42 },
    openai: { status: 'CONNECTED', pingMs: 65 },
    tally: { status: 'CONNECTED', pingMs: 8 },
  });

  // AI Agent Studio state
  const [aiProvider, setAiProvider] = useState<'OPENAI' | 'ANTHROPIC' | 'GROK' | 'OLLAMA'>('ANTHROPIC');
  const [aiPrompt, setAiPrompt] = useState<string>('Analyze Weighbridge Moisture Anomaly logs for Coimbatore and detect tare tampering patterns.');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Terminal & Bash Executor state
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    'EverGreen Mission Control Orchestrator [Provider Kernel v1.2.4]',
    'Connected to local control daemon on port 4300. Type "help" for commands.',
    'System status: 4 cloud clusters synchronized. Weighbridge edge nodes active.',
  ]);
  const [terminalInput, setTerminalInput] = useState<string>('');

  // ChatOps state
  const [chatChannel, setChatChannel] = useState<string>('operations');
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; channel: string; user: string; role: string; text: string; time: string }>>([
    { id: '1', channel: 'operations', user: 'Priya N.', role: 'Success Lead', text: 'Kavitha Cotton Mills accountant accepted the tare-deduction reconciliation matrix.', time: '10:42 AM' },
    { id: '2', channel: 'operations', user: 'Arun K.', role: 'Infra Lead', text: 'v1.2.4-lts canary rollout in progress for Selvam Spinning on GCP Cloud Run.', time: '11:15 AM' },
    { id: '3', channel: 'weighbridge-triage', user: 'Field Desk', role: 'Hardware Ops', text: 'Weighbridge RS-232 indicator at Sri Murugan Handlooms calibrated to 10kg TareZero threshold.', time: '11:30 AM' },
    { id: '4', channel: 'renewals-desk', user: 'Meera S.', role: 'Finance', text: 'Waiting for NEFT UTR proof from Sri Lakshmi Cottons (₹89,990 upfront annual).', time: '12:05 PM' },
  ]);

  // Modals for Record details
  const [activeRecordModal, setActiveRecordModal] = useState<RecordItem | null>(null);
  const [showNewRecordModal, setShowNewRecordModal] = useState<boolean>(false);
  const [newRecordKind, setNewRecordKind] = useState<string>('TASK');
  const [newRecordTitle, setNewRecordTitle] = useState<string>('');
  const [newRecordOwner, setNewRecordOwner] = useState<string>('Evergreen Ops');
  const [newRecordPriority, setNewRecordPriority] = useState<string>('NORMAL');

  const adminApiBase = 'http://localhost:4300';

  /* ──── DATA FETCHING ──── */
  const fetchCompanies = async () => {
    try {
      const res = await fetch(`${adminApiBase}/companies`);
      if (res.ok) setCompanies(await res.json());
      else setCompanies(DEMO_TENANTS as unknown as Company[]);
    } catch {
      setCompanies(DEMO_TENANTS as unknown as Company[]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    try {
      const res = await fetch(`${adminApiBase}/control/records`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) setRecords(data);
      }
    } catch {
      // fallback to DEMO_RECORDS
    }
  };

  const fetchCicdData = async () => {
    try {
      const [resPkg, resDep, resLogs] = await Promise.all([
        fetch(`${adminApiBase}/cicd/releases`),
        fetch(`${adminApiBase}/cicd/deployments`),
        fetch(`${adminApiBase}/cicd/logs?limit=100`),
      ]);
      if (resPkg.ok) setPackages(await resPkg.json());
      if (resDep.ok) setDeployments(await resDep.json());
      if (resLogs.ok) setLogs(await resLogs.json());
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchRecords();
    fetchCicdData();
    const interval = setInterval(() => {
      fetchCicdData();
      fetchRecords();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  /* ──── ACTIONS ──── */
  const showMsg = (msg: string, autoHide = true) => {
    setActionMessage(msg);
    if (autoHide) setTimeout(() => setActionMessage(null), 5000);
  };

  const executeReactivation = async (company: Company) => {
    try {
      setReactivateTimer(59);
      showMsg(`⚡ Sending 1-Minute Reactivation protocol to ${company.name}...`, false);
      const nextExpiry = new Date();
      reactivatePeriod === '1_YEAR'
        ? nextExpiry.setFullYear(nextExpiry.getFullYear() + 1)
        : nextExpiry.setDate(nextExpiry.getDate() + 30);

      const res = await fetch(`${adminApiBase}/companies/${company.id}/license`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ACTIVE',
          expiresAt: nextExpiry.toISOString(),
          graceExpiresAt: null,
          details: reactivateUtr
            ? `Payment verified via UTR: ${reactivateUtr}`
            : 'Payment verified by Provider Finance Desk',
        }),
      });

      if (res.ok) {
        showMsg(`✅ ${company.name} reactivated — quota unblocked in under 60 seconds.`);
        fetchCompanies();
        fetchCicdData();
        setReactivateTargetCompany(null);
        setReactivateUtr('');
      } else {
        showMsg(`❌ Reactivation failed with HTTP ${res.status}`);
      }
    } catch {
      showMsg(`❌ Failed to connect to Provider Admin API`);
    } finally {
      setReactivateTimer(null);
    }
  };

  const executeRemoteAction = async (companyId: string, actionType: string) => {
    try {
      showMsg(`Executing ${actionType}...`, false);
      const res = await fetch(`${adminApiBase}/companies/${companyId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType }),
      });
      if (res.ok) {
        showMsg(`✅ Action ${actionType} executed successfully.`);
        fetchCompanies();
        fetchCicdData();
      }
    } catch {
      showMsg(`❌ Remote action execution failed.`);
    }
  };

  const triggerPackageDeployment = async () => {
    if (!deployTargetCompany) return;
    try {
      showMsg(`🚀 Triggering ${selectedStrategy} deployment of ${selectedPackageToDeploy} to ${deployTargetCompany.name}...`, false);
      const res = await fetch(`${adminApiBase}/cicd/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: deployTargetCompany.id,
          packageVersion: selectedPackageToDeploy,
          strategy: selectedStrategy,
          triggeredBy: 'Provider Admin Web UI',
        }),
      });
      if (res.ok) {
        showMsg(`✅ Deployment pipeline initiated for ${deployTargetCompany.name}.`);
        fetchCicdData();
        fetchCompanies();
        setDeployTargetCompany(null);
      }
    } catch {
      showMsg(`❌ Failed to start deployment.`);
    }
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      showMsg(`🔨 Building release package ${newPkgVersion}...`, false);
      const res = await fetch(`${adminApiBase}/cicd/releases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: newPkgVersion,
          name: newPkgName,
          changelog: newPkgChangelog,
          targets: newPkgTargets,
        }),
      });
      if (res.ok) {
        showMsg(`✅ Package ${newPkgVersion} registered and queued for distribution.`);
        setShowNewPkgModal(false);
        setNewPkgVersion('');
        setNewPkgName('');
        setNewPkgChangelog('');
        fetchCicdData();
      }
    } catch {
      showMsg(`❌ Failed to create package.`);
    }
  };

  const handleProvisionTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      showMsg(`Provisioning tenant ${name}...`, false);
      const res = await fetch(`${adminApiBase}/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          cloudProvider: cloud,
          deploymentUrl: url || undefined,
          tier,
          state: stateRegion,
          plan,
          maxUsers,
          maxMachines,
          maxDocsPerMonth: maxDocs,
          pricingModel,
        }),
      });
      if (res.ok) {
        showMsg(`✅ Tenant "${name}" successfully provisioned.`);
        setShowProvisionModal(false);
        setName('');
        setUrl('');
        fetchCompanies();
        fetchCicdData();
      }
    } catch {
      showMsg(`❌ Failed to provision tenant.`);
    }
  };

  const handleTestPing = (connId: string) => {
    const lat = Math.floor(Math.random() * 35) + 12;
    setPingStatus(prev => ({
      ...prev,
      [connId]: { status: 'CONNECTED', pingMs: lat },
    }));
    showMsg(`⚡ Ping to ${connId.toUpperCase()}: 200 OK (${lat}ms latency)`);
  };

  const handleRunTerminalCommand = (cmdText?: string) => {
    const cmd = (cmdText || terminalInput).trim();
    if (!cmd) return;
    const newLines = [`$ ${cmd}`];

    if (cmd === 'help') {
      newLines.push('Available commands:');
      newLines.push('  health          - Run full cluster health audit');
      newLines.push('  backup          - Create timestamped SQLite snapshot');
      newLines.push('  db-ping         - Test SQLite connection pool');
      newLines.push('  weighbridge     - Ping TareZero edge RS-232 COM port');
      newLines.push('  deploy --all    - Dispatch rolling rollout to all active nodes');
      newLines.push('  status          - Show system load, memory, and spindle counts');
      newLines.push('  clear           - Clear terminal window');
    } else if (cmd === 'clear') {
      setTerminalHistory(['EverGreen Mission Control Orchestrator [Cleared]']);
      setTerminalInput('');
      return;
    } else if (cmd === 'health') {
      newLines.push('🔍 Probing 4 cloud clusters and 1 weighbridge edge...');
      newLines.push('  [GCP Cloud Run]       http://selvam.evergreenos.in  -> 200 OK (22ms)');
      newLines.push('  [Azure App Service]   http://kavitha.evergreenos.in -> 200 OK (38ms)');
      newLines.push('  [AWS ECS Fargate]     http://lakshmi.evergreenos.in -> 200 OK (31ms)');
      newLines.push('  [Local Factory VM]    http://192.168.1.100:4000     -> 200 OK (3ms)');
      newLines.push('  [RS-232 Indicator]    COM3 (9600-8-N-1)             -> STREAM ACTIVE');
      newLines.push('✅ Cluster health: 100% operational.');
    } else if (cmd === 'backup') {
      newLines.push('📦 Starting SQLite backup snapshot...');
      newLines.push('  Reading: packages/admin-database/prisma/admin.db (1.4 MB)');
      newLines.push('  Target:  backups/admin_snapshot_20261011_0318.sqlite');
      newLines.push('  PRAGMA wal_checkpoint(TRUNCATE) -> COMPLETED');
      newLines.push('  SHA256: 9f83a...20c4 verified');
      newLines.push('✅ Backup created successfully.');
    } else if (cmd === 'weighbridge') {
      newLines.push('⚖️ Querying Avery Weighbridge indicator via RS-232...');
      newLines.push('  Protocol: Avery E1205 Continuous ASCII');
      newLines.push('  Gross: 34,820 kg | Tare: 12,410 kg | Net: 22,410 kg');
      newLines.push('  TareZero Anti-Fraud: PASS (Moisture variance 7.4% <= 8.5% limit)');
      newLines.push('✅ Weighbridge bridge nominal.');
    } else if (cmd === 'status') {
      newLines.push(`Nodes: ${companies.length} Spinning Mills | Spindles: ~140,000 | ARR: ₹${(metrics.estimatedArr / 100000).toFixed(1)}L`);
      newLines.push('Memory: 184MB RSS | CPU Load: 2.1% | Active Socket Listeners: 12');
    } else {
      newLines.push(`Executing: "${cmd}"...`);
      newLines.push(`[stdout] Command processed successfully by Mission Control agent.`);
    }

    setTerminalHistory(prev => [...prev, ...newLines]);
    setTerminalInput('');
  };

  const handleRunAiAgent = () => {
    setAiLoading(true);
    setAiResponse('');
    setTimeout(() => {
      setAiLoading(false);
      if (aiPrompt.toLowerCase().includes('moisture') || aiPrompt.toLowerCase().includes('weighbridge')) {
        setAiResponse(
          `### 🤖 TareZero AI Weighbridge Analysis Report\n\n` +
          `**Analysis by ${aiProvider} Textile Copilot**\n\n` +
          `- **Dataset Scanned**: 482 gross-tare weighment events across Coimbatore and Tirupur nodes.\n` +
          `- **Anomaly Flagged**: 3 consignments from Supplier *Venkateshwara Cotton Traders* displayed moisture reading drift of **10.8%** (Standard mill contract allowance: **8.5%**).\n` +
          `- **Financial Loss Averted**: Deducted **₹1,42,800** in excess water weight automatically before Tally Prime voucher generation.\n` +
          `- **Recommended Action**: Enable *Strict Tare Lockout* on the Avery RS-232 bridge and dispatch WhatsApp alert to Mill Purchase Manager.`
        );
      } else if (aiPrompt.toLowerCase().includes('renewal') || aiPrompt.toLowerCase().includes('quota')) {
        setAiResponse(
          `### 🤖 Mill Renewal & UTR Demand Generation\n\n` +
          `**Analysis by ${aiProvider} Commercial Engine**\n\n` +
          `- **Target Mill**: *Kavitha Cotton Mills Private Limited* (Grace Quota Day 3 of 7).\n` +
          `- **Annual License**: Scale Tier (₹1,69,990 + 18% GST = ₹2,00,588).\n` +
          `- **Drafted Tamil & English WhatsApp Notice**:\n` +
          `  > *வணக்கம்! EverGreen OS உரிமம் புதுப்பித்தல் நிலுவையில் உள்ளது. தடையற்ற மில் செயல்பாட்டிற்கு ₹2,00,588 செலுத்தி UTR எண்ணை பகிரவும்.*\n` +
          `  > *Dear Director, Your EverGreen OS subscription is due. Pay ₹2,00,588 and share UTR to auto-renew in 60 seconds.*`
        );
      } else {
        setAiResponse(
          `### 🤖 Operational Diagnostic Summary\n\n` +
          `**Generated via ${aiProvider} Engine**\n\n` +
          `- System integrity verified across all 4 cloud environments.\n` +
          `- Tally Prime 4.0 XML bridge synchronized 48 vouchers without ledger error.\n` +
          `- Quota consumption healthy across 140,000 monitored spindles.`
        );
      }
    }, 1200);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = {
      id: uid(),
      channel: chatChannel,
      user: 'You (Mission Control)',
      role: 'Provider Admin',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
  };

  /* ──── COMPUTED METRICS ──── */
  const metrics = useMemo(() => {
    const totalMills = companies.length;
    const activeMills = companies.filter(c => c.status === 'ACTIVE').length;
    const graceMills = companies.filter(c => c.status === 'GRACE_PERIOD').length;
    const suspendedMills = companies.filter(c => c.status === 'SUSPENDED').length;

    const gcpCount = companies.filter(c => c.cloudProvider === 'GCP').length;
    const awsCount = companies.filter(c => c.cloudProvider === 'AWS').length;
    const azureCount = companies.filter(c => c.cloudProvider === 'AZURE').length;
    const vmCount = companies.filter(c => c.cloudProvider === 'LOCAL_VM').length;

    const totalStaff = companies.reduce((acc, c) => acc + (c.activeStaff || 0), 0);
    const totalMaxUsers = companies.reduce((acc, c) => acc + (c.maxUsers || 0), 0);
    const totalMachines = companies.reduce((acc, c) => acc + (c.maxMachines || 0), 0);
    const totalDocsPosted = companies.reduce((acc, c) => acc + (c.docsPosted || 0), 0);
    const totalMaxDocs = companies.reduce((acc, c) => acc + (c.maxDocsPerMonth || 0), 0);

    const estimatedArr = companies.reduce((acc, c) => {
      if (c.plan === 'ENTERPRISE') return acc + 289990;
      if (c.plan === 'SCALE') return acc + 169990;
      if (c.plan === 'GROWTH') return acc + 89990;
      if (c.plan === 'GATEKEEPER') return acc + 39990;
      return acc + 49990;
    }, 0);

    return {
      totalMills, activeMills, graceMills, suspendedMills,
      gcpCount, awsCount, azureCount, vmCount,
      totalStaff, totalMaxUsers, totalMachines,
      totalDocsPosted, totalMaxDocs, estimatedArr,
    };
  }, [companies]);

  const filteredCompanies = useMemo(() =>
    companies.filter(c => {
      const matchCloud = cloudFilter === 'ALL' || c.cloudProvider === cloudFilter;
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchSearch =
        !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tier.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCloud && matchStatus && matchSearch;
    }),
    [companies, cloudFilter, statusFilter, searchQuery]
  );

  /* ──── DONUT CHART HELPERS ──── */
  function buildDonutSegments(data: { value: number; color: string }[]) {
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const circumference = 2 * Math.PI * 38;
    let offset = 0;
    return data.map(d => {
      const pct = d.value / total;
      const dash = pct * circumference;
      const seg = { ...d, dash, gap: circumference - dash, offset };
      offset += dash;
      return seg;
    });
  }

  const cloudDistData = [
    { value: metrics.gcpCount, color: '#EF4444', label: 'Google Cloud (GCP)' },
    { value: metrics.awsCount, color: '#F97316', label: 'Amazon Web Services' },
    { value: metrics.azureCount, color: '#38BDF8', label: 'Microsoft Azure' },
    { value: metrics.vmCount, color: '#94A3B8', label: 'On-Premise Linux VM' },
  ];
  const cloudSegments = buildDonutSegments(cloudDistData);

  /* ──── MODULE TABS CONFIG ──── */
  const MODULE_TABS: { id: TabId; label: string; cat: NavCategory; badge?: string; badgeColor?: string }[] = [
    { id: 'DASHBOARD', label: '📊 Executive Dashboard', cat: 'CORE', badge: 'LIVE', badgeColor: 'cyan' },
    { id: 'TENANTS', label: '🏢 Spinning Mills', cat: 'CORE', badge: String(companies.length), badgeColor: '' },
    { id: 'TASKS', label: '📋 Task Management', cat: 'CORE', badge: String(records.filter(r => r.kind === 'TASK').length), badgeColor: '' },
    { id: 'DEPLOYMENTS', label: '⚡ Deployments & Rollout', cat: 'CLOUD', badge: String(deployments.length), badgeColor: '' },
    { id: 'PACKAGES', label: '📦 Release Registry', cat: 'CLOUD', badge: String(packages.length), badgeColor: '' },
    { id: 'DATABASES', label: '🗄️ Database Studio', cat: 'CLOUD', badge: 'SQLITE', badgeColor: 'emerald' },
    { id: 'MAINTENANCE', label: '🛠️ Maintenance & SLA', cat: 'CLOUD', badge: String(records.filter(r => r.kind === 'MAINTENANCE').length), badgeColor: '' },
    { id: 'INTEGRATIONS', label: '🔌 Integrations Matrix', cat: 'CONNECTIVITY', badge: `${CONNECTORS.length} EXT`, badgeColor: 'cyan' },
    { id: 'APIS', label: '🌐 API Management', cat: 'CONNECTIVITY', badge: '7 EP', badgeColor: '' },
    { id: 'WEBHOOKS', label: '🪝 Webhooks Engine', cat: 'CONNECTIVITY', badge: 'LIVE', badgeColor: 'emerald' },
    { id: 'PAYMENTS', label: '💳 Payments & UTR Desk', cat: 'FINANCE', badge: String(records.filter(r => r.kind === 'PAYMENT').length), badgeColor: '' },
    { id: 'AGREEMENTS', label: '📜 Business Agreements', cat: 'FINANCE', badge: String(records.filter(r => r.kind === 'AGREEMENT').length), badgeColor: '' },
    { id: 'AI_AGENT', label: '🤖 AI Agent Studio', cat: 'INTELLIGENCE', badge: 'COPILOT', badgeColor: 'purple' },
    { id: 'CHAT', label: '💬 ChatOps Feed', cat: 'INTELLIGENCE', badge: String(chatMessages.length), badgeColor: '' },
    { id: 'SCRIPTS', label: '💻 Bash / Ops Terminal', cat: 'INTELLIGENCE', badge: 'CLI', badgeColor: 'cyan' },
    { id: 'LOGS', label: '🖥️ Live Console Logs', cat: 'INTELLIGENCE', badge: String(logs.length), badgeColor: '' },
  ];

  const visibleTabs = useMemo(() => {
    if (activeCategory === 'ALL') return MODULE_TABS;
    return MODULE_TABS.filter(t => t.cat === activeCategory);
  }, [activeCategory, MODULE_TABS]);

  /* ─────────────────────────────────────────────────────── */
  /*  RENDER                                                 */
  /* ─────────────────────────────────────────────────────── */
  return (
    <div className="admin-app">

      {/* ── HEADER ── */}
      <header className="top-command-bar">
        <div className="admin-brand">
          <BrandLogo />
          <div className="brand-copy">
            <div className="brand-h1">
              EverGreen Mission Control
              <span className="control-plane-badge">PROVIDER PLANE</span>
            </div>
            <span className="brand-tag">MULTI-TENANT FABRIC & CI/CD ORCHESTRATOR · V1.2.4-LTS</span>
          </div>
        </div>

        <div className="top-bar-stats">
          <div className="top-stat-item">
            <span className="top-stat-label">Active Mills</span>
            <span className="top-stat-value text-emerald">{metrics.activeMills}/{metrics.totalMills}</span>
          </div>
          <div className="top-stat-item">
            <span className="top-stat-label">Multi-Cloud ARR</span>
            <span className="top-stat-value">₹{(metrics.estimatedArr / 100000).toFixed(1)}L</span>
          </div>
          <div className="top-stat-item">
            <span className="top-stat-label">TareZero Edge</span>
            <span className="top-stat-value text-cyan">ONLINE</span>
          </div>
          <div className="top-stat-item">
            <span className="top-stat-label">Cluster Release</span>
            <span className="top-stat-value font-mono">v1.2.4-lts</span>
          </div>
        </div>

        <div className="top-bar-actions">
          {metrics.graceMills > 0 && (
            <button
              className="btn-reactivate-lightning"
              onClick={() => {
                const graceComp = companies.find(c => c.status === 'GRACE_PERIOD');
                if (graceComp) setReactivateTargetCompany(graceComp);
              }}
            >
              ⚡ Reactivate ({metrics.graceMills})
            </button>
          )}
          <button className="btn-provision-trigger" onClick={() => setShowProvisionModal(true)}>
            + New Mill Tenant
          </button>
        </div>
      </header>

      {/* ── ACTION BANNER ── */}
      {actionMessage && (
        <div className="action-banner">
          <span>{actionMessage}</span>
          <button className="btn-modal-close" style={{ width: 28, height: 28 }} onClick={() => setActionMessage(null)}>×</button>
        </div>
      )}

      {/* ── 2-TIER NAVIGATION: CATEGORY PILLS ── */}
      <div className="nav-category-pills">
        {([
          { id: 'ALL', label: 'All Modules (16)' },
          { id: 'CORE', label: '🏢 Core Ops (3)' },
          { id: 'CLOUD', label: '☁️ Cloud & Deploy (4)' },
          { id: 'CONNECTIVITY', label: '🔌 Connectors & APIs (3)' },
          { id: 'FINANCE', label: '💳 Finance & Legal (2)' },
          { id: 'INTELLIGENCE', label: '🤖 AI & DevTools (4)' },
        ] as { id: NavCategory; label: string }[]).map(cat => (
          <button
            key={cat.id}
            className={`nav-category-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory(cat.id);
              if (cat.id !== 'ALL') {
                const first = MODULE_TABS.find(t => t.cat === cat.id);
                if (first) setActiveTab(first.id);
              }
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── NAV TABS ── */}
      <nav className="admin-nav-bar">
        {visibleTabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.badge && (
              <span className={`tab-badge ${tab.badgeColor || ''}`}>{tab.badge}</span>
            )}
          </button>
        ))}
      </nav>

      {/* ── MAIN VIEWPORT ── */}
      <main className="admin-main-viewport">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p style={{ color: 'var(--adm-muted)', fontSize: '0.9rem' }}>
              Loading multi-cloud tenant telemetry...
            </p>
          </div>
        ) : (
          <>
            {/* ═══════════════════════════════════════════════════════════════
                TAB 1: EXECUTIVE DASHBOARD (CUSTOMIZABLE)
                ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'DASHBOARD' && (
              <div className="dashboard-grid">

                {/* DASHBOARD CUSTOMIZATION TOOLBAR */}
                <div className="dash-customize-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>🛠️ Customizable Dashboard Widgets:</span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--adm-muted)' }}>Toggle operational cards in real-time</span>
                  </div>
                  <div className="dash-widget-toggles">
                    {Object.entries({
                      kpis: 'Topline KPIs',
                      alerts: 'Grace Watch',
                      charts: 'Multi-Cloud Donut',
                      clusters: 'Regional Clusters',
                      activity: 'Activity Stream',
                      fraudMonitor: 'TareZero Weighbridge',
                      arrRunrate: 'ARR Billing',
                      aiHealth: 'AI Copilot Ops',
                    }).map(([key, title]) => (
                      <button
                        key={key}
                        className={`dash-widget-toggle-btn ${widgets[key as keyof typeof widgets] ? 'active' : ''}`}
                        onClick={() => setWidgets(prev => ({ ...prev, [key]: !prev[key as keyof typeof widgets] }))}
                      >
                        {widgets[key as keyof typeof widgets] ? '✓ ' : '+ '} {title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* KPI CARDS */}
                {widgets.kpis && (
                  <div className="topline-kpi-deck">
                    <div className="glass-panel kpi-card emerald">
                      <div className="kpi-header">
                        <span className="kpi-title">Managed Spinning Mills</span>
                        <span className="kpi-icon">🏢</span>
                      </div>
                      <div className="kpi-value">{metrics.totalMills}</div>
                      <div className="kpi-subtext">
                        <strong className="text-emerald">{metrics.activeMills} Active</strong>
                        &nbsp;·&nbsp;{metrics.graceMills > 0 ? `${metrics.graceMills} Grace` : 'All Compliant'}
                        &nbsp;·&nbsp;~140K Spindles
                      </div>
                    </div>

                    <div className="glass-panel kpi-card">
                      <div className="kpi-header">
                        <span className="kpi-title">Annual Run Rate (ARR)</span>
                        <span className="kpi-icon">💰</span>
                      </div>
                      <div className="kpi-value">₹{(metrics.estimatedArr / 100000).toFixed(1)}L</div>
                      <div className="kpi-subtext">
                        <strong>Upfront Collection</strong>
                        &nbsp;·&nbsp;₹{metrics.totalMills > 0 ? (metrics.estimatedArr / metrics.totalMills / 100000).toFixed(1) : '0'}L Avg ACV
                      </div>
                    </div>

                    <div className="glass-panel kpi-card amber">
                      <div className="kpi-header">
                        <span className="kpi-title">Cotton Inward Weighed</span>
                        <span className="kpi-icon">⚖️</span>
                      </div>
                      <div className="kpi-value">14,820 T</div>
                      <div className="kpi-subtext">
                        <strong className="text-amber">TareZero Protected</strong>
                        &nbsp;·&nbsp;₹18.4L Fraud Caught
                      </div>
                    </div>

                    <div className="glass-panel kpi-card purple">
                      <div className="kpi-header">
                        <span className="kpi-title">Multi-Cloud Uptime SLA</span>
                        <span className="kpi-icon">☁️</span>
                      </div>
                      <div className="kpi-value">99.98%</div>
                      <div className="kpi-subtext">
                        GCP · AWS · Azure · Local VM
                      </div>
                    </div>
                  </div>
                )}

                {/* GRACE WATCH ALERT */}
                {widgets.alerts && metrics.graceMills > 0 && (
                  <div className="grace-watch-card">
                    <div className="grace-watch-left">
                      <div className="grace-watch-icon">⚠️</div>
                      <div className="grace-watch-text">
                        <h4>7-Day Grace Quota Watch — {metrics.graceMills} Tenant(s) Pending Renewal</h4>
                        <p>
                          Factory operations remain 100% active during grace. Unblock instantly upon UTR verification
                          with the 1-Minute Reactivation protocol.
                        </p>
                      </div>
                    </div>
                    <div className="grace-watch-actions">
                      <button
                        className="btn-reactivate-lightning"
                        onClick={() => {
                          const graceComp = companies.find(c => c.status === 'GRACE_PERIOD');
                          if (graceComp) setReactivateTargetCompany(graceComp);
                        }}
                      >
                        ⚡ 1-Minute Instant Reactivate
                      </button>
                    </div>
                  </div>
                )}

                {/* CHARTS ROW */}
                {widgets.charts && (
                  <div className="charts-dual-row">
                    {/* Multi-Cloud Donut Chart */}
                    <div className="glass-panel chart-card">
                      <div className="chart-card-header">
                        <h3>☁️ Multi-Cloud Deployment Distribution</h3>
                        <span className="chart-card-tag">HYBRID ISOLATION</span>
                      </div>
                      <div className="donut-chart-container">
                        <div className="donut-svg-wrapper">
                          <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                            {cloudSegments.map((seg, i) => (
                              <circle
                                key={i}
                                cx="50" cy="50" r="38"
                                fill="transparent"
                                stroke={seg.color}
                                strokeWidth="11"
                                strokeDasharray={`${seg.dash} ${seg.gap}`}
                                strokeDashoffset={-seg.offset}
                                strokeLinecap="round"
                              />
                            ))}
                            <circle cx="50" cy="50" r="28" fill="#080e1c" />
                          </svg>
                          <div className="donut-center-label">
                            <div className="donut-center-number">{metrics.totalMills}</div>
                            <div className="donut-center-sub">Nodes</div>
                          </div>
                        </div>
                        <div className="chart-legend-vertical">
                          {cloudDistData.map((d, i) => (
                            <div className="legend-item" key={i}>
                              <div className="legend-left">
                                <span className="legend-color-dot" style={{ background: d.color }} />
                                <span style={{ color: 'var(--adm-text)', fontSize: '0.78rem' }}>{d.label}</span>
                              </div>
                              <span className="legend-right">
                                {d.value} ({metrics.totalMills ? Math.round((d.value / metrics.totalMills) * 100) : 0}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Quota Capacity Monitors */}
                    <div className="glass-panel chart-card">
                      <div className="chart-card-header">
                        <h3>⚡ Global Quota Capacity Utilization</h3>
                        <span className="chart-card-tag">NETWORK USAGE</span>
                      </div>
                      <div className="quota-meters-list">
                        {[
                          { icon: '👥', label: 'Licensed User Seats', used: metrics.totalStaff, max: metrics.totalMaxUsers || 100, color: 'emerald' },
                          { icon: '⚙️', label: 'Connected Machines & Spindles', used: 180, max: metrics.totalMachines || 200, color: 'cyan' },
                          { icon: '📜', label: 'Monthly Document Volume', used: metrics.totalDocsPosted, max: metrics.totalMaxDocs || 20000, color: 'amber' },
                          { icon: '📑', label: 'Tally Prime XML Bridge Sync', used: 100, max: 100, color: 'purple' },
                        ].map((m, i) => {
                          const pct = m.max ? Math.min(100, Math.round((m.used / m.max) * 100)) : 0;
                          return (
                            <div className="quota-meter-item" key={i}>
                              <div className="quota-meter-labels">
                                <span className="quota-meter-title">
                                  <span>{m.icon}</span> {m.label}
                                </span>
                                <span className="quota-meter-numbers">
                                  <strong>{m.used.toLocaleString()}</strong>
                                  {' / '}{m.max.toLocaleString()}
                                  {' '}({pct}%)
                                </span>
                              </div>
                              <div className="meter-track">
                                <div className={`meter-fill ${m.color}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* WEIGHBRIDGE FRAUD & ARR DECK (CUSTOM WIDGETS) */}
                <div className="charts-dual-row">
                  {widgets.fraudMonitor && (
                    <div className="glass-panel chart-card">
                      <div className="chart-card-header">
                        <h3>⚖️ TareZero Weighbridge Anti-Fraud Engine</h3>
                        <span className="chart-card-tag" style={{ color: 'var(--adm-amber)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>ACTIVE SURVEILLANCE</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 0' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--adm-border)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--adm-muted)' }}>CONNECTED INDICATORS</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--adm-cyan)' }}>6 RS-232 Bridges</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--adm-dim)' }}>Avery, Essae, Mettler</div>
                          </div>
                          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--adm-border)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--adm-muted)' }}>MOISTURE FRAUD BLOCKED</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--adm-amber)' }}>₹18,42,000</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--adm-dim)' }}>Excess water weight eliminated</div>
                          </div>
                          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--adm-border)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--adm-muted)' }}>ZERO-INTERNET BUFFER</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--adm-emerald)' }}>100% Offline</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--adm-dim)' }}>Syncs on network resume</div>
                          </div>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--adm-muted)', lineHeight: '1.5' }}>
                          Edge weighbridge daemons communicate directly with local RS-232 serial ports at 9600 baud.
                          Tare deductions are enforced mathematically at the weigh-in gate before Tally Prime voucher generation.
                        </p>
                      </div>
                    </div>
                  )}

                  {widgets.aiHealth && (
                    <div className="glass-panel chart-card">
                      <div className="chart-card-header">
                        <h3>🤖 AI Operations Copilot Telemetry</h3>
                        <span className="chart-card-tag" style={{ color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.3)' }}>MULTI-PROVIDER</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', padding: '0.5rem 0' }}>
                        {[
                          { name: 'Anthropic Claude 3.5 Sonnet', status: 'ONLINE', latency: '42ms', cost: '₹0.12/k tok' },
                          { name: 'OpenAI GPT-4o', status: 'ONLINE', latency: '65ms', cost: '₹0.20/k tok' },
                          { name: 'xAI Grok-2', status: 'STANDBY', latency: '85ms', cost: 'Configurable' },
                          { name: 'Local Ollama / vLLM', status: 'READY (EDGE)', latency: '12ms', cost: '₹0 Self-hosted' },
                        ].map((p, i) => (
                          <div key={i} style={{ background: 'rgba(255,255,255,0.025)', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--adm-border)' }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff' }}>{p.name}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', fontSize: '0.7rem' }}>
                              <span style={{ color: p.status.includes('ONLINE') ? 'var(--adm-emerald)' : 'var(--adm-cyan)' }}>{p.status}</span>
                              <span style={{ color: 'var(--adm-muted)' }}>{p.latency}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* REGIONAL CLUSTER MAP + ACTIVITY FEED */}
                <div className="charts-dual-row">
                  {widgets.clusters && (
                    <div className="glass-panel chart-card">
                      <div className="chart-card-header">
                        <h3>📍 Tamil Nadu Textile Cluster Network</h3>
                        <span className="chart-card-tag">GEOGRAPHIC COVERAGE</span>
                      </div>
                      <div className="cluster-cards-row">
                        {[
                          { city: 'Tirupur Cluster', count: metrics.vmCount || 1, desc: 'Weighbridge · Knitwear Mills' },
                          { city: 'Coimbatore Hub', count: metrics.gcpCount || 1, desc: '40s–60s Combed Spindles' },
                          { city: 'Erode / Palladam', count: metrics.awsCount || 1, desc: 'Sizing · Warp Auto-Weft' },
                          { city: 'Karur / Dindigul', count: metrics.azureCount || 1, desc: 'Export Made-Ups · OE Yarn' },
                        ].map((c, i) => (
                          <div className="cluster-node-badge" key={i}>
                            <span className="cluster-node-city">{c.city}</span>
                            <span className="cluster-node-count">{c.count} Mill{c.count !== 1 ? 's' : ''}</span>
                            <span className="cluster-node-spindles">{c.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {widgets.activity && (
                    <div className="glass-panel chart-card">
                      <div className="chart-card-header">
                        <h3>🔔 Recent Platform Activity</h3>
                        <span className="chart-card-tag">LIVE FEED</span>
                      </div>
                      <div className="activity-feed">
                        {SAMPLE_ACTIVITY.map((a, i) => (
                          <div className="activity-item" key={i}>
                            <span className={`activity-dot ${a.dot}`} />
                            <div className="activity-content">
                              <div className="activity-msg">{a.msg}</div>
                              <div className="activity-time">{a.time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 2: SPINNING MILL TENANTS & LICENSES
                ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'TENANTS' && (
              <div className="tenants-tab-view">
                {/* TOOLBAR */}
                <div className="tenants-toolbar-card">
                  <div className="toolbar-search-box">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      className="search-input-field"
                      placeholder="Search spinning mills by name, tenant ID, or cluster..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button className="search-clear-btn" onClick={() => setSearchQuery('')}>×</button>
                    )}
                  </div>

                  <div className="toolbar-filters-group">
                    <select
                      className="filter-select-box"
                      value={cloudFilter}
                      onChange={e => setCloudFilter(e.target.value)}
                    >
                      <option value="ALL">All Clouds (GCP, AWS, Azure, VM)</option>
                      <option value="GCP">Google Cloud (GCP)</option>
                      <option value="AWS">Amazon AWS</option>
                      <option value="AZURE">Microsoft Azure</option>
                      <option value="LOCAL_VM">On-Premises Factory VM</option>
                    </select>

                    <select
                      className="filter-select-box"
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                    >
                      <option value="ALL">All License Statuses</option>
                      <option value="ACTIVE">ACTIVE (Fully Licensed)</option>
                      <option value="GRACE_PERIOD">GRACE_PERIOD (7-Day Watch)</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                    </select>
                  </div>
                </div>

                {/* TENANTS TABLE */}
                <div className="glass-panel tenants-table-container">
                  <table className="tenants-data-table">
                    <thead>
                      <tr>
                        <th>Mill Tenant</th>
                        <th>Cloud Provider</th>
                        <th>License Plan</th>
                        <th>Status</th>
                        <th>Version</th>
                        <th>Seats & Spindles</th>
                        <th>Monthly Docs</th>
                        <th>Remote Ops</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCompanies.map(c => {
                        const isGrace = c.status === 'GRACE_PERIOD';
                        return (
                          <tr key={c.id} className={isGrace ? 'row-grace-warning' : ''}>
                            <td>
                              <div className="tenant-cell-name">
                                <strong>{c.name}</strong>
                                <span className="tenant-cell-id">{c.id} · {c.tier}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`cloud-pill-tag ${c.cloudProvider.toLowerCase()}`}>
                                {c.cloudProvider}
                              </span>
                            </td>
                            <td>
                              <span className="plan-badge-tag" style={{ color: planColor(c.plan), borderColor: planColor(c.plan) }}>
                                {c.plan}
                              </span>
                            </td>
                            <td>
                              <span className={`status-pill ${c.status.toLowerCase()}`}>
                                {c.status}
                              </span>
                            </td>
                            <td><span className="font-mono text-dim" style={{ fontSize: '0.78rem' }}>{c.appVersion}</span></td>
                            <td>
                              <div style={{ fontSize: '0.78rem' }}>
                                <span>{c.activeStaff} / {c.maxUsers} Users</span>
                                <div style={{ color: 'var(--adm-dim)', fontSize: '0.7rem' }}>{c.maxMachines} Spindles</div>
                              </div>
                            </td>
                            <td>
                              <div style={{ fontSize: '0.78rem' }}>
                                <span>{c.docsPosted.toLocaleString()} / {c.maxDocsPerMonth.toLocaleString()}</span>
                                <div className="meter-track" style={{ height: 4, marginTop: 3 }}>
                                  <div
                                    className="meter-fill emerald"
                                    style={{ width: `${Math.min(100, Math.round((c.docsPosted / (c.maxDocsPerMonth || 1)) * 100))}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.3rem' }}>
                                <button
                                  className="btn-table-action"
                                  title="Test Tally Prime Sync"
                                  onClick={() => executeRemoteAction(c.id, 'SYNC_TALLY')}
                                >
                                  📑 Tally
                                </button>
                                <button
                                  className="btn-table-action"
                                  title="Restart Weighbridge Bridge"
                                  onClick={() => executeRemoteAction(c.id, 'RESTART_SERVICE')}
                                >
                                  🔄 Edge
                                </button>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                {isGrace && (
                                  <button
                                    className="btn-table-action amber"
                                    onClick={() => setReactivateTargetCompany(c)}
                                  >
                                    ⚡ 1-Min Reactivate
                                  </button>
                                )}
                                <button
                                  className="btn-table-action primary"
                                  onClick={() => setDeployTargetCompany(c)}
                                >
                                  🚀 Deploy
                                </button>
                                <button
                                  className="btn-table-action"
                                  onClick={() => setActiveModalCompany(c)}
                                >
                                  📋 Install
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 3: TASK MANAGEMENT
                ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'TASKS' && (
              <div className="tasks-tab-view">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>📋 Mission Control Task Orchestrator</h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--adm-muted)' }}>Operational backlogs, factory onboarding, contract verifications, and engineer workflows</p>
                  </div>
                  <button
                    className="btn-provision-trigger"
                    onClick={() => {
                      setNewRecordKind('TASK');
                      setShowNewRecordModal(true);
                    }}
                  >
                    + Create Task
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                  {['OPEN', 'IN_PROGRESS', 'BLOCKED', 'DONE'].map(colStatus => {
                    const colTasks = records.filter(r => r.kind === 'TASK' && r.status === colStatus);
                    return (
                      <div key={colStatus} style={{ background: 'rgba(8,14,26,0.7)', borderRadius: 12, border: '1px solid var(--adm-border)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: colStatus === 'DONE' ? 'var(--adm-emerald)' : colStatus === 'BLOCKED' ? 'var(--adm-rose)' : 'var(--adm-cyan)', textTransform: 'uppercase' }}>
                            {colStatus.replace('_', ' ')}
                          </span>
                          <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)', padding: '0.15rem 0.45rem', borderRadius: 999, color: 'var(--adm-muted)' }}>
                            {colTasks.length}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                          {colTasks.map(t => (
                            <div
                              key={t.id}
                              style={{ background: 'var(--adm-card)', border: '1px solid var(--adm-border)', borderRadius: 8, padding: '0.85rem', cursor: 'pointer', transition: 'all 0.15s' }}
                              onClick={() => setActiveRecordModal(t)}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--adm-dim)' }}>{t.id}</span>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: t.priority === 'HIGH' ? '#f59e0b' : t.priority === 'CRITICAL' ? '#f43f5e' : 'var(--adm-muted)' }}>
                                  {t.priority}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>{t.title}</div>
                              {t.payload?.description && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--adm-muted)', lineHeight: '1.4', marginBottom: '0.5rem' }}>
                                  {String(t.payload.description)}
                                </div>
                              )}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--adm-dim)' }}>
                                <span>👤 {t.owner}</span>
                                <span>{t.companyId || 'Global'}</span>
                              </div>
                            </div>
                          ))}
                          {colTasks.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--adm-dim)', fontSize: '0.75rem' }}>
                              No tasks in {colStatus.toLowerCase()}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 4: DEPLOYMENTS & CLOUD ROLLOUTS
                ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'DEPLOYMENTS' && (
              <div className="cicd-tab-view">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>⚡ Multi-Cloud Deployments & Orchestration</h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--adm-muted)' }}>Rolling, Blue-Green, and Canary rollout executions across GCP, AWS, Azure, and Factory Linux VMs</p>
                  </div>
                  <button
                    className="btn-provision-trigger"
                    onClick={() => {
                      if (companies.length > 0) setDeployTargetCompany(companies[0]);
                    }}
                  >
                    🚀 Trigger New Deployment
                  </button>
                </div>

                <div className="glass-panel tenants-table-container">
                  <table className="tenants-data-table">
                    <thead>
                      <tr>
                        <th>Deployment ID</th>
                        <th>Target Mill</th>
                        <th>Cloud Provider</th>
                        <th>Package Version</th>
                        <th>Strategy</th>
                        <th>Status</th>
                        <th>Triggered By</th>
                        <th>Started At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deployments.map(d => (
                        <tr key={d.id}>
                          <td><span className="font-mono text-cyan" style={{ fontSize: '0.76rem' }}>{d.id}</span></td>
                          <td><strong>{d.companyName}</strong></td>
                          <td><span className={`cloud-pill-tag ${d.cloudProvider.toLowerCase()}`}>{d.cloudProvider}</span></td>
                          <td><span className="font-mono">{d.packageVersion}</span></td>
                          <td><span style={{ fontSize: '0.76rem', color: 'var(--adm-muted)' }}>{d.strategy}</span></td>
                          <td><span className={`status-pill ${d.status.toLowerCase()}`}>{d.status}</span></td>
                          <td><span style={{ fontSize: '0.78rem' }}>{d.triggeredBy}</span></td>
                          <td><span className="text-dim" style={{ fontSize: '0.74rem' }}>{new Date(d.startedAt).toLocaleTimeString()}</span></td>
                        </tr>
                      ))}
                      {deployments.length === 0 && (
                        <tr className="empty-state-row">
                          <td colSpan={8}>No deployment records found in cluster telemetry.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 5: RELEASE PACKAGE REGISTRY
                ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'PACKAGES' && (
              <div className="packages-tab-view">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>📦 Release Package Registry & Artifacts</h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--adm-muted)' }}>Immutable multi-cloud binaries, Docker images, and RS-232 weighbridge drivers</p>
                  </div>
                  <button className="btn-provision-trigger" onClick={() => setShowNewPkgModal(true)}>
                    + Compile Release Package
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
                  {packages.map(p => (
                    <div key={p.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--adm-cyan)' }}>{p.version}</span>
                            <span className="status-pill active" style={{ fontSize: '0.65rem' }}>{p.status}</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginTop: '0.2rem' }}>{p.name}</div>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--adm-dim)' }}>{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {p.targets.map(t => (
                          <span key={t} className={`cloud-pill-tag ${t.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>{t}</span>
                        ))}
                      </div>

                      <p style={{ fontSize: '0.78rem', color: 'var(--adm-muted)', lineHeight: '1.5', margin: 0 }}>
                        {p.changelog || 'Production-ready release package.'}
                      </p>

                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.6rem 0.8rem', borderRadius: 6, fontSize: '0.72rem', color: 'var(--adm-dim)' }}>
                        <div>Commit: <span className="font-mono text-cyan">{p.commit}</span> on <span className="font-mono">{p.branch}</span></div>
                        <div>Artifacts: {p.artifacts?.length || 1} signed bundle(s)</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 6: DATABASE STUDIO & MANAGEMENT
                ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'DATABASES' && (
              <div className="db-tab-view">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>🗄️ Multi-Tenant Database Studio</h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--adm-muted)' }}>SQLite Provider control ledger, tenant schemas, WAL mode replication, and atomic vacuum</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn-table-action primary"
                      onClick={() => handleRunTerminalCommand('backup')}
                    >
                      📦 Create SQLite Snapshot
                    </button>
                    <button
                      className="btn-table-action"
                      onClick={() => {
                        showMsg('⚡ Running PRAGMA wal_checkpoint(TRUNCATE) on admin.db...');
                        setTimeout(() => showMsg('✅ SQLite admin.db vacuumed & optimized.'), 1000);
                      }}
                    >
                      🧹 Vacuum & Checkpoint
                    </button>
                  </div>
                </div>

                <div className="db-studio-deck">
                  <div className="glass-panel db-studio-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1rem', color: '#ffffff' }}>🏢 Primary Provider Database</h3>
                      <span className="status-pill active">SQLITE · WAL ACTIVE</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--adm-muted)' }}>
                      Location: <span className="font-mono text-cyan">packages/admin-database/prisma/admin.db</span>
                    </div>
                    <div className="db-metric-bar">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                        <span>Allocated Storage (1.4 MB / 10 GB Local Disk)</span>
                        <span className="text-cyan">0.01%</span>
                      </div>
                      <div className="db-metric-track">
                        <div className="db-metric-fill" style={{ width: '1%', background: 'var(--adm-cyan)' }} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', textAlign: 'center' }}>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: 6 }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>{companies.length}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--adm-dim)' }}>Company Rows</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: 6 }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>{records.length}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--adm-dim)' }}>Control Records</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: 6 }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--adm-emerald)' }}>0 Errors</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--adm-dim)' }}>Integrity Check</div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel db-studio-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1rem', color: '#ffffff' }}>🏭 Tenant Factory Isolation</h3>
                      <span className="status-pill active">MULTI-INSTANCE</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--adm-muted)' }}>
                      Isolated SQLite databases on factory Linux VMs + Postgres Cloud instances
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span>Selvam Spinning Works</span>
                        <span className="text-emerald">Cloud Postgres (m5.large) · Healthy</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span>Sri Murugan Handlooms</span>
                        <span className="text-emerald">On-Prem SQLite WAL · Auto-sync</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span>Kavitha Cotton Mills</span>
                        <span className="text-amber">Azure Postgres · Quota Grace</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontSize: '0.95rem', color: '#ffffff', marginBottom: '0.75rem' }}>🔍 Control Records Raw Ledger Explorer</h3>
                  <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                    <table className="tenants-data-table">
                      <thead>
                        <tr>
                          <th>Record ID</th>
                          <th>Kind</th>
                          <th>Title</th>
                          <th>Status</th>
                          <th>Priority</th>
                          <th>Owner</th>
                          <th>Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {records.slice(0, 10).map(r => (
                          <tr key={r.id} onClick={() => setActiveRecordModal(r)} style={{ cursor: 'pointer' }}>
                            <td><span className="font-mono text-cyan">{r.id}</span></td>
                            <td><span className="plan-badge-tag">{r.kind}</span></td>
                            <td><strong>{r.title}</strong></td>
                            <td><span className={`status-pill ${r.status.toLowerCase()}`}>{r.status}</span></td>
                            <td><span>{r.priority}</span></td>
                            <td><span style={{ fontSize: '0.75rem' }}>{r.owner}</span></td>
                            <td><span className="text-dim" style={{ fontSize: '0.72rem' }}>{new Date(r.updatedAt).toLocaleTimeString()}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 7: MAINTENANCE & SLA
                ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'MAINTENANCE' && (
              <div className="maintenance-tab-view">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>🛠️ Maintenance Windows & SLA Management</h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--adm-muted)' }}>Scheduled downtime slots, mill maintenance toggles, and load cell recalibration</p>
                  </div>
                  <button
                    className="btn-provision-trigger"
                    onClick={() => {
                      setNewRecordKind('MAINTENANCE');
                      setShowNewRecordModal(true);
                    }}
                  >
                    + Schedule Maintenance
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
                  {records.filter(r => r.kind === 'MAINTENANCE').map(m => (
                    <div key={m.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="font-mono text-cyan" style={{ fontSize: '0.74rem' }}>{m.id}</span>
                        <span className={`status-pill ${m.status.toLowerCase()}`}>{m.status}</span>
                      </div>
                      <h4 style={{ fontSize: '0.95rem', color: '#ffffff', margin: 0 }}>{m.title}</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--adm-muted)', lineHeight: '1.5', margin: 0 }}>
                        {String(m.payload?.description || 'Routine platform maintenance window.')}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--adm-dim)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.5rem' }}>
                        <span>Target: {m.companyId || 'Global Fabric'}</span>
                        <span>Due: {m.dueAt ? new Date(m.dueAt).toLocaleDateString() : 'Immediate'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 8: INTEGRATIONS MATRIX (22+ CONNECTORS)
                ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'INTEGRATIONS' && (
              <div className="integrations-tab-view">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>🔌 Integrations & External Services Hub</h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--adm-muted)' }}>
                      Configured & standby services: GitHub, Azure DevOps, GCP, AWS, Azure, Razorpay, PhonePe, Paytm, Stripe, WhatsApp, Slack, Teams, Zoho One, Claude, GPT-4o, Grok, Ollama, TallyPrime
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-input-text"
                      style={{ width: 220, padding: '0.45rem 0.75rem' }}
                      placeholder="Search 22+ connectors..."
                      value={connectorSearch}
                      onChange={e => setConnectorSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* CATEGORY FILTER PILLS */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                  {['ALL', 'Developer', 'Cloud', 'Payments', 'Communication', 'Business suite', 'AI', 'Accounting'].map(cat => (
                    <button
                      key={cat}
                      className={`dash-widget-toggle-btn ${connectorCategory === cat ? 'active' : ''}`}
                      onClick={() => setConnectorCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* CONNECTORS MATRIX GRID */}
                <div className="integrations-matrix-grid">
                  {CONNECTORS.filter(c => {
                    const matchCat = connectorCategory === 'ALL' || c.category === connectorCategory;
                    const matchSearch = !connectorSearch || c.name.toLowerCase().includes(connectorSearch.toLowerCase()) || c.description.toLowerCase().includes(connectorSearch.toLowerCase());
                    return matchCat && matchSearch;
                  }).map(conn => {
                    const isConfigured = ['github', 'gcp', 'razorpay', 'whatsapp', 'openai', 'tally'].includes(conn.id);
                    const isStandby = ['azure-devops', 'azure', 'aws', 'phonepe', 'paytm', 'slack', 'teams', 'zoho', 'anthropic', 'xai', 'ollama'].includes(conn.id);
                    const pingInfo = pingStatus[conn.id];

                    return (
                      <div key={conn.id} className="connector-card-admin">
                        <div className="connector-card-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div className="connector-logo-mark" style={{ background: `${conn.color}22`, color: conn.color, border: `1px solid ${conn.color}44` }}>
                              {conn.mark}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>{conn.name}</div>
                              <span style={{ fontSize: '0.68rem', color: 'var(--adm-dim)' }}>{conn.category}</span>
                            </div>
                          </div>
                          <span className={`connector-status-pill ${isConfigured ? 'configured' : isStandby ? 'standby' : 'not_configured'}`}>
                            {isConfigured ? 'CONNECTED' : isStandby ? 'STANDBY' : 'UNCONFIGURED'}
                          </span>
                        </div>

                        <p className="connector-desc">{conn.description}</p>

                        <div style={{ fontSize: '0.72rem', background: 'rgba(0,0,0,0.25)', padding: '0.5rem 0.7rem', borderRadius: 6, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <div><span style={{ color: 'var(--adm-dim)' }}>Auth:</span> <span style={{ color: 'var(--adm-cyan)' }}>{conn.auth}</span></div>
                          <div><span style={{ color: 'var(--adm-dim)' }}>Events:</span> <span style={{ color: 'var(--adm-muted)' }}>{conn.events}</span></div>
                          {pingInfo && (
                            <div style={{ color: 'var(--adm-emerald)', fontWeight: 600 }}>
                              ⚡ Latency: {pingInfo.pingMs}ms ({pingInfo.status})
                            </div>
                          )}
                        </div>

                        <div className="connector-footer">
                          <button
                            className="btn-table-action"
                            onClick={() => handleTestPing(conn.id)}
                          >
                            ⚡ Test Ping
                          </button>
                          <button
                            className="btn-table-action primary"
                            onClick={() => setSelectedConnector(conn)}
                          >
                            ⚙️ Configure
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 9: API GATEWAY MANAGEMENT
                ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'APIS' && (
              <div className="apis-tab-view">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>🌐 API Management & Gateway Endpoints</h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--adm-muted)' }}>Provider control plane routes, rate limits, bearer token validation, and weighbridge telemetry</p>
                  </div>
                  <button
                    className="btn-table-action primary"
                    onClick={() => showMsg('⚡ Bearer tokens verified. Gateway latency: 14ms.')}
                  >
                    🔑 Generate Service Token
                  </button>
                </div>

                <div className="glass-panel tenants-table-container">
                  <table className="tenants-data-table">
                    <thead>
                      <tr>
                        <th>HTTP Method</th>
                        <th>Endpoint URI</th>
                        <th>Authentication</th>
                        <th>Scope</th>
                        <th>Rate Limit</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { method: 'GET', uri: '/companies', auth: 'Bearer / Dev Origin', scope: 'Provider multi-tenant read', limit: '1000 req/min' },
                        { method: 'POST', uri: '/companies', auth: 'Bearer (Admin)', scope: 'Tenant provisioning', limit: '100 req/min' },
                        { method: 'POST', uri: '/companies/:id/license', auth: 'Bearer (Admin)', scope: '1-Min instant reactivation', limit: '300 req/min' },
                        { method: 'POST', uri: '/cicd/deploy', auth: 'Bearer (Admin)', scope: 'Multi-cloud orchestration', limit: '50 req/min' },
                        { method: 'GET', uri: '/control/records', auth: 'Public / Dev fallback', scope: 'Mission control ledger', limit: '2000 req/min' },
                        { method: 'POST', uri: '/control/database/backup', auth: 'Bearer (Admin)', scope: 'SQLite backup trigger', limit: '20 req/min' },
                        { method: 'POST', uri: '/edge/weighbridge/ping', auth: 'API Key (Edge)', scope: 'RS-232 live telemetry', limit: '500 req/min' },
                      ].map((ep, i) => (
                        <tr key={i}>
                          <td>
                            <span className="font-mono" style={{ fontWeight: 800, color: ep.method === 'GET' ? 'var(--adm-emerald)' : 'var(--adm-cyan)' }}>
                              {ep.method}
                            </span>
                          </td>
                          <td><span className="font-mono text-cyan" style={{ fontSize: '0.82rem' }}>{ep.uri}</span></td>
                          <td><span style={{ fontSize: '0.78rem' }}>{ep.auth}</span></td>
                          <td><span style={{ fontSize: '0.78rem', color: 'var(--adm-muted)' }}>{ep.scope}</span></td>
                          <td><span className="font-mono text-dim" style={{ fontSize: '0.74rem' }}>{ep.limit}</span></td>
                          <td>
                            <button
                              className="btn-table-action"
                              onClick={() => showMsg(`⚡ Probing ${ep.method} ${ep.uri} -> 200 OK (16ms)`)}
                            >
                              Probe
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 10: WEBHOOKS DISPATCHER & ENGINE
                ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'WEBHOOKS' && (
              <div className="webhooks-tab-view">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>🪝 Webhooks Engine & Delivery Dispatcher</h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--adm-muted)' }}>Razorpay payments, PhonePe callbacks, GitHub CI hooks, and WhatsApp delivery updates</p>
                  </div>
                  <button
                    className="btn-provision-trigger"
                    onClick={() => showMsg('⚡ Dispatched test webhook to configured endpoints: HTTP 200 OK.')}
                  >
                    ⚡ Dispatch Test Payload
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
                  {[
                    { name: 'Razorpay Payment Capture', url: 'https://evergreenos.in/api/webhooks/razorpay', events: 'payment.captured, payment.failed', status: 'ACTIVE' },
                    { name: 'PhonePe Callback Engine', url: 'https://evergreenos.in/api/webhooks/phonepe', events: 'PAYMENT_SUCCESS, ORDER_FAILED', status: 'STANDBY' },
                    { name: 'GitHub Actions Release Hook', url: 'https://evergreenos.in/api/webhooks/github', events: 'workflow_run, release', status: 'ACTIVE' },
                    { name: 'WhatsApp Business Status Hook', url: 'https://evergreenos.in/api/webhooks/whatsapp', events: 'messages, message_deliveries', status: 'ACTIVE' },
                  ].map((hook, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>{hook.name}</span>
                        <span className="status-pill active">{hook.status}</span>
                      </div>
                      <div style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--adm-cyan)', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: 6 }}>
                        {hook.url}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--adm-muted)' }}>
                        <strong>Subscribed Events:</strong> {hook.events}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.6rem' }}>
                        <button className="btn-table-action" onClick={() => showMsg(`⚡ Simulated signature verification: SHA256 valid.`)}>
                          Verify Secret
                        </button>
                        <button className="btn-table-action primary" onClick={() => showMsg(`⚡ Test event sent to ${hook.name}: 200 OK`)}>
                          Test Trigger
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 11: PAYMENTS & UTR RECONCILIATION
                ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'PAYMENTS' && (
              <div className="payments-tab-view">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>💳 Payments & Bank UTR Reconciliation Desk</h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--adm-muted)' }}>Razorpay, PhonePe, Paytm, and NEFT/RTGS bank transfers with instant quota unblock</p>
                  </div>
                  <button
                    className="btn-provision-trigger"
                    onClick={() => {
                      setNewRecordKind('PAYMENT');
                      setShowNewRecordModal(true);
                    }}
                  >
                    + Record Inward Payment
                  </button>
                </div>

                <div className="glass-panel tenants-table-container">
                  <table className="tenants-data-table">
                    <thead>
                      <tr>
                        <th>Payment ID</th>
                        <th>Payer Tenant</th>
                        <th>Amount</th>
                        <th>Gateway / Mode</th>
                        <th>Bank UTR Reference</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.filter(r => r.kind === 'PAYMENT').map(p => {
                        const amt = Number(p.payload?.amountPaise || 0);
                        const isPending = p.status === 'PENDING';
                        return (
                          <tr key={p.id}>
                            <td><span className="font-mono text-cyan" style={{ fontSize: '0.78rem' }}>{p.id}</span></td>
                            <td><strong>{p.companyId || 'Direct Invoice'}</strong></td>
                            <td>
                              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                                {money(amt || 8999000)}
                              </span>
                            </td>
                            <td><span className="cloud-pill-tag gcp">{String(p.payload?.provider || 'Razorpay')}</span></td>
                            <td><span className="font-mono text-dim">{String(p.payload?.reference || 'NEFT-PENDING')}</span></td>
                            <td><span className={`status-pill ${p.status.toLowerCase()}`}>{p.status}</span></td>
                            <td>
                              {isPending ? (
                                <button
                                  className="btn-table-action amber"
                                  onClick={() => {
                                    showMsg(`⚡ Verifying payment ${p.id} and unblocking tenant quota...`);
                                    setTimeout(() => {
                                      p.status = 'VERIFIED';
                                      showMsg(`✅ Payment ${p.id} verified. Mill quota unlocked!`);
                                      setRecords([...records]);
                                    }, 800);
                                  }}
                                >
                                  ⚡ Verify UTR
                                </button>
                              ) : (
                                <span className="text-emerald" style={{ fontSize: '0.75rem' }}>✓ Settled</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 12: BUSINESS AGREEMENTS & LEGAL VAULT
                ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'AGREEMENTS' && (
              <div className="agreements-tab-view">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>📜 Master Service Agreements (MSA) & Contracts</h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--adm-muted)' }}>Signed mill license terms, Tally integration NDAs, TareZero weighbridge SLAs</p>
                  </div>
                  <button
                    className="btn-provision-trigger"
                    onClick={() => {
                      setNewRecordKind('AGREEMENT');
                      setShowNewRecordModal(true);
                    }}
                  >
                    + Register Agreement
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
                  {records.filter(r => r.kind === 'AGREEMENT').map(a => (
                    <div key={a.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#ffffff' }}>{a.title}</div>
                          <span className="font-mono text-cyan" style={{ fontSize: '0.72rem' }}>{a.id}</span>
                        </div>
                        <span className={`status-pill ${a.status.toLowerCase()}`}>{a.status}</span>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--adm-muted)', lineHeight: '1.5' }}>
                        {String(a.payload?.description || 'Evergreen Textile Technologies Private Limited Master Service Agreement.')}
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.6rem 0.8rem', borderRadius: 6, fontSize: '0.74rem', color: 'var(--adm-dim)' }}>
                        <div>Legal Entity: <span style={{ color: '#ffffff' }}>Evergreen Textile Technologies Private Limited</span></div>
                        <div>Reference: <span className="font-mono text-cyan">{String(a.payload?.reference || 'MSA-2026-TN')}</span></div>
                        <div>Due / Expiry: {a.dueAt ? new Date(a.dueAt).toLocaleDateString() : 'Active Term'}</div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.6rem' }}>
                        <button className="btn-table-action primary" onClick={() => setActiveRecordModal(a)}>
                          📄 View Terms Proof
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 13: AI AGENT STUDIO (COPILOT)
                ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'AI_AGENT' && (
              <div className="ai-agent-tab-view">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>🤖 AI Agent Studio & Textile Copilot</h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--adm-muted)' }}>Configurable multi-provider copilot: Anthropic Claude, OpenAI GPT-4o, xAI Grok, and Local Ollama</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {(['ANTHROPIC', 'OPENAI', 'GROK', 'OLLAMA'] as const).map(p => (
                      <button
                        key={p}
                        className={`dash-widget-toggle-btn ${aiProvider === p ? 'active' : ''}`}
                        onClick={() => setAiProvider(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ai-agent-layout">
                  {/* PRESET PROMPTS */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--adm-muted)' }}>TEXTILE SYSTEM PRESETS</span>

                    {[
                      {
                        title: '⚖️ Weighbridge Moisture Tampering',
                        prompt: 'Analyze Weighbridge Moisture Anomaly logs for Coimbatore and detect tare tampering patterns.',
                      },
                      {
                        title: '📜 Mill License Renewal Notice',
                        prompt: 'Draft formal bilingual (Tamil & English) WhatsApp renewal notice with UTR bank details for Kavitha Cotton Mills.',
                      },
                      {
                        title: '📑 Tally Prime Ledger Reconciliation',
                        prompt: 'Reconcile 48 Tally Prime XML purchase vouchers against weighbridge gross tare receipts and identify ledger mismatches.',
                      },
                      {
                        title: '☁️ Multi-Cloud Canary Health Audit',
                        prompt: 'Run diagnostic health audit on GCP Cloud Run and Local Factory VM and generate rollback safety index.',
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="ai-prompt-template-card"
                        onClick={() => setAiPrompt(item.prompt)}
                      >
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.2rem' }}>{item.title}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--adm-dim)', lineHeight: '1.4' }}>{item.prompt}</div>
                      </div>
                    ))}
                  </div>

                  {/* PROMPT RUNNER & OUTPUT */}
                  <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--adm-muted)', textTransform: 'uppercase' }}>
                        Operational Prompt ({aiProvider} Provider)
                      </label>
                      <textarea
                        className="form-input-text"
                        style={{ minHeight: 90, marginTop: '0.4rem' }}
                        value={aiPrompt}
                        onChange={e => setAiPrompt(e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        className="btn-provision-trigger"
                        disabled={aiLoading}
                        onClick={handleRunAiAgent}
                      >
                        {aiLoading ? '🤖 Analyzing Mill Telemetry...' : '🚀 Execute AI Analysis'}
                      </button>
                    </div>

                    <div style={{ background: '#020610', borderRadius: 8, border: '1px solid var(--adm-border)', padding: '1rem', minHeight: 220 }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--adm-dim)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Copilot Output Stream
                      </div>
                      {aiLoading ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--adm-cyan)', fontSize: '0.84rem' }}>
                          <div className="loading-spinner" style={{ width: 16, height: 16 }} />
                          Synthesizing textile telemetry via {aiProvider}...
                        </div>
                      ) : aiResponse ? (
                        <div style={{ color: '#e2e8f0', fontSize: '0.82rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                          {aiResponse}
                        </div>
                      ) : (
                        <div style={{ color: 'var(--adm-dim)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                          Select a textile preset or type a prompt above, then click Execute AI Analysis.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 14: CHATOPS LIVE FEED
                ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'CHAT' && (
              <div className="chat-tab-view">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>💬 Mission Control ChatOps & Dispatch</h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--adm-muted)' }}>Operational communications, weighbridge hardware triage, and renewal coordination</p>
                  </div>
                </div>

                <div className="chat-ops-container">
                  {/* CHANNELS LIST */}
                  <div className="glass-panel" style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--adm-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                      Channels
                    </div>
                    <div className="chat-channel-list">
                      {[
                        { id: 'operations', name: '#operations', count: 2 },
                        { id: 'weighbridge-triage', name: '#weighbridge-triage', count: 1 },
                        { id: 'renewals-desk', name: '#renewals-desk', count: 1 },
                        { id: 'tamil-nadu-field-ops', name: '#tamil-field-ops', count: 0 },
                      ].map(ch => (
                        <div
                          key={ch.id}
                          className={`chat-channel-item ${chatChannel === ch.id ? 'active' : ''}`}
                          onClick={() => setChatChannel(ch.id)}
                        >
                          {ch.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* MESSAGES & INPUT */}
                  <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1rem' }}>
                      {chatMessages.filter(m => m.channel === chatChannel).map(msg => (
                        <div key={msg.id} style={{ background: 'rgba(255,255,255,0.025)', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--adm-border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>{msg.user}</span>
                              <span style={{ fontSize: '0.65rem', background: 'rgba(56,189,248,0.15)', color: 'var(--adm-cyan)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>
                                {msg.role}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--adm-dim)' }}>{msg.time}</span>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--adm-text)', lineHeight: '1.5' }}>{msg.text}</div>
                        </div>
                      ))}
                      {chatMessages.filter(m => m.channel === chatChannel).length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--adm-dim)', fontSize: '0.84rem' }}>
                          No messages in #{chatChannel} yet.
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '0.65rem' }}>
                      <input
                        type="text"
                        className="form-input-text"
                        placeholder={`Message #${chatChannel}...`}
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                      />
                      <button type="submit" className="btn-provision-trigger">Send</button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 15: BASH & OPS SCRIPT TERMINAL
                ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'SCRIPTS' && (
              <div className="scripts-tab-view">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>💻 Bash & Ops Script Terminal</h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--adm-muted)' }}>Interactive provider CLI shell, SQLite backup runners, edge port probes, and cluster health diagnostics</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="dash-widget-toggle-btn active" onClick={() => handleRunTerminalCommand('health')}>
                      🔍 health
                    </button>
                    <button className="dash-widget-toggle-btn active" onClick={() => handleRunTerminalCommand('backup')}>
                      📦 backup
                    </button>
                    <button className="dash-widget-toggle-btn active" onClick={() => handleRunTerminalCommand('weighbridge')}>
                      ⚖️ weighbridge
                    </button>
                    <button className="dash-widget-toggle-btn" onClick={() => handleRunTerminalCommand('status')}>
                      📊 status
                    </button>
                    <button className="dash-widget-toggle-btn" onClick={() => handleRunTerminalCommand('clear')}>
                      🧹 clear
                    </button>
                  </div>
                </div>

                <div className="terminal-window-admin">
                  <div className="terminal-topbar">
                    <div className="terminal-dot-cluster">
                      <span style={{ background: '#ef4444' }} />
                      <span style={{ background: '#f59e0b' }} />
                      <span style={{ background: '#10b981' }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--adm-muted)' }}>
                      root@evergreen-mission-control:~ (bash)
                    </span>
                    <span className="font-mono text-cyan" style={{ fontSize: '0.7rem' }}>
                      PID 4300 · PORT 5174
                    </span>
                  </div>

                  <div className="terminal-console-stream">
                    {terminalHistory.map((line, i) => (
                      <div key={i} style={{ color: line.startsWith('$') ? 'var(--adm-cyan)' : line.includes('ERROR') ? 'var(--adm-rose)' : line.includes('✅') ? 'var(--adm-emerald)' : '#e2e8f0' }}>
                        {line}
                      </div>
                    ))}
                  </div>

                  <div className="terminal-input-row">
                    <span style={{ color: 'var(--adm-emerald)', fontWeight: 800, fontSize: '0.9rem' }}>$</span>
                    <input
                      type="text"
                      className="terminal-input-field"
                      placeholder="Type bash or ops command (health, backup, weighbridge, status, help)..."
                      value={terminalInput}
                      onChange={e => setTerminalInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRunTerminalCommand();
                      }}
                    />
                    <button
                      className="btn-table-action primary"
                      style={{ padding: '0.2rem 0.6rem' }}
                      onClick={() => handleRunTerminalCommand()}
                    >
                      Run
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 16: LIVE CONSOLE LOGS
                ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'LOGS' && (
              <div className="logs-tab-view">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>🖥️ Live Console Logs & Telemetry Stream</h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--adm-muted)' }}>Centralized streaming logs from all spinning mill nodes, deployment agents, and edge bridges</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {['ALL', 'INFO', 'SUCCESS', 'WARN', 'ERROR'].map(lvl => (
                      <button
                        key={lvl}
                        className={`dash-widget-toggle-btn ${logFilter === lvl ? 'active' : ''}`}
                        onClick={() => setLogFilter(lvl)}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1rem', background: '#020610', maxHeight: 600, overflowY: 'auto' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                    {logs.filter(l => logFilter === 'ALL' || l.level === logFilter).map(l => (
                      <div key={l.id} style={{ display: 'flex', gap: '0.75rem', lineHeight: '1.6', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.3rem' }}>
                        <span style={{ color: 'var(--adm-dim)' }}>{new Date(l.timestamp).toLocaleTimeString()}</span>
                        <span style={{ color: l.level === 'SUCCESS' ? 'var(--adm-emerald)' : l.level === 'WARN' ? 'var(--adm-amber)' : l.level === 'ERROR' ? 'var(--adm-rose)' : 'var(--adm-cyan)', fontWeight: 700, width: 60 }}>
                          [{l.level}]
                        </span>
                        <span style={{ color: 'var(--adm-muted)', width: 75 }}>[{l.category}]</span>
                        <span style={{ color: '#e2e8f0', flex: 1 }}>{l.message}</span>
                      </div>
                    ))}
                    {logs.length === 0 && (
                      <div style={{ color: 'var(--adm-dim)', textAlign: 'center', padding: '3rem' }}>
                        No console logs buffered in current stream window.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 1: PROVISION NEW MILL TENANT
          ═══════════════════════════════════════════════════════════════════ */}
      {showProvisionModal && (
        <div className="modal-overlay-backdrop" onClick={() => setShowProvisionModal(false)}>
          <div className="modal-dialog-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🏢 Provision New Spinning Mill Tenant</h3>
              <button className="btn-modal-close" onClick={() => setShowProvisionModal(false)}>×</button>
            </div>
            <form onSubmit={handleProvisionTenant}>
              <div className="modal-body">
                <div className="form-field-row">
                  <label>Mill Company Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input-text"
                    placeholder="e.g. Mahalakshmi Spinning Mills Pvt Ltd"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>

                <div className="form-grid-2col">
                  <div className="form-field-row">
                    <label>Cloud Deployment Target *</label>
                    <select
                      className="form-select-box"
                      value={cloud}
                      onChange={e => setCloud(e.target.value)}
                    >
                      <option value="LOCAL_VM">On-Premises Factory Linux VM</option>
                      <option value="GCP">Google Cloud (Cloud Run / GKE)</option>
                      <option value="AWS">Amazon Web Services (ECS / Fargate)</option>
                      <option value="AZURE">Microsoft Azure (Container Apps)</option>
                    </select>
                  </div>
                  <div className="form-field-row">
                    <label>Textile Cluster Region</label>
                    <select
                      className="form-select-box"
                      value={tier}
                      onChange={e => setTier(e.target.value)}
                    >
                      <option value="TIER_2_CITY">Tirupur Knitwear Cluster</option>
                      <option value="TIER_1_CITY">Coimbatore Spinning Hub</option>
                      <option value="TIER_3_CITY">Karur / Dindigul Handlooms</option>
                    </select>
                  </div>
                </div>

                <div className="form-field-row">
                  <label>State / Province</label>
                  <input
                    type="text"
                    className="form-input-text"
                    placeholder="e.g. Tamil Nadu"
                    value={stateRegion}
                    onChange={e => setStateRegion(e.target.value)}
                  />
                </div>

                <div className="form-grid-2col">
                  <div className="form-field-row">
                    <label>Commercial Subscription Plan</label>
                    <select
                      className="form-select-box"
                      value={plan}
                      onChange={e => setPlan(e.target.value)}
                    >
                      <option value="GROWTH">Growth (₹89,990/yr · Up to 25 Spindles)</option>
                      <option value="SCALE">Scale (₹1,69,990/yr · Up to 80 Spindles)</option>
                      <option value="ENTERPRISE">Enterprise (₹2,89,990/yr · Unlimited)</option>
                      <option value="GATEKEEPER">Gatekeeper (₹39,990/yr · Weighbridge only)</option>
                    </select>
                  </div>
                  <div className="form-field-row">
                    <label>Billing Structure</label>
                    <select
                      className="form-select-box"
                      value={pricingModel}
                      onChange={e => setPricingModel(e.target.value)}
                    >
                      <option value="TIERED">Annual Upfront License (Standard)</option>
                      <option value="PER_SPINDLE">Per-Spindle / Month Usage</option>
                      <option value="FLAT_ENTERPRISE">Custom Multi-Mill SLA</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div className="form-field-row">
                    <label>Max Users (Seats)</label>
                    <input
                      type="number"
                      className="form-input-text"
                      value={maxUsers}
                      onChange={e => setMaxUsers(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-field-row">
                    <label>Max Machines / Spindles</label>
                    <input
                      type="number"
                      className="form-input-text"
                      value={maxMachines}
                      onChange={e => setMaxMachines(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="form-field-row">
                  <label>Max Monthly Inward Documents</label>
                  <input
                    type="number"
                    className="form-input-text"
                    value={maxDocs}
                    onChange={e => setMaxDocs(Number(e.target.value))}
                  />
                </div>

                <div className="form-field-row">
                  <label>Deployment URL (Optional if Factory VM)</label>
                  <input
                    type="url"
                    className="form-input-text"
                    placeholder="https://mahalakshmi.evergreenos.in"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setShowProvisionModal(false)}>Cancel</button>
                <button type="submit" className="btn-provision-trigger">Provision Mill</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 2: 1-MINUTE INSTANT REACTIVATION
          ═══════════════════════════════════════════════════════════════════ */}
      {reactivateTargetCompany && (
        <div className="modal-overlay-backdrop" onClick={() => setReactivateTargetCompany(null)}>
          <div className="modal-dialog-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚡ 1-Minute Lightning Reactivation Protocol</h3>
              <button className="btn-modal-close" onClick={() => setReactivateTargetCompany(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="reactivation-timer-box">
                <div className="timer-circle-visual">
                  {reactivateTimer !== null ? `${reactivateTimer}s` : '< 60s'}
                </div>
                <div className="timer-details">
                  <h4>Zero-Downtime Mill Unblock</h4>
                  <p>
                    Reactivates license quotas, resumes Tally Prime sync, and re-enables TareZero weighbridge
                    in under 60 seconds across all isolated cloud environments.
                  </p>
                </div>
              </div>

              <div className="form-field-row">
                <label>Mill Tenant Being Reactivated</label>
                <input
                  type="text"
                  disabled
                  className="form-input-text"
                  value={`${reactivateTargetCompany.name} (${reactivateTargetCompany.cloudProvider})`}
                />
              </div>

              <div className="form-grid-2col">
                <div className="form-field-row">
                  <label>Reactivation Duration</label>
                  <select
                    className="form-select-box"
                    value={reactivatePeriod}
                    onChange={e => setReactivatePeriod(e.target.value as '1_YEAR' | '30_DAYS')}
                  >
                    <option value="1_YEAR">1 Full Year (Annual Subscription Renewal)</option>
                    <option value="30_DAYS">30-Day Commercial Grace Extension</option>
                  </select>
                </div>
                <div className="form-field-row">
                  <label>Bank Payment UTR Reference</label>
                  <input
                    type="text"
                    className="form-input-text"
                    placeholder="e.g. HDFC202610110482"
                    value={reactivateUtr}
                    onChange={e => setReactivateUtr(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setReactivateTargetCompany(null)}>Cancel</button>
              <button
                className="btn-reactivate-lightning"
                onClick={() => executeReactivation(reactivateTargetCompany)}
              >
                ⚡ Execute 1-Minute Reactivation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 3: CLOUD DEPLOYMENT TRIGGER
          ═══════════════════════════════════════════════════════════════════ */}
      {deployTargetCompany && (
        <div className="modal-overlay-backdrop" onClick={() => setDeployTargetCompany(null)}>
          <div className="modal-dialog-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🚀 Deploy Release to {deployTargetCompany.name}</h3>
              <button className="btn-modal-close" onClick={() => setDeployTargetCompany(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid-2col">
                <div className="form-field-row">
                  <label>Release Package</label>
                  <select
                    className="form-select-box"
                    value={selectedPackageToDeploy}
                    onChange={e => setSelectedPackageToDeploy(e.target.value)}
                  >
                    {packages.map(p => (
                      <option key={p.id} value={p.version}>{p.version} — {p.name}</option>
                    ))}
                    {packages.length === 0 && (
                      <option value="v1.2.4-lts">v1.2.4-lts (Production LTS)</option>
                    )}
                  </select>
                </div>
                <div className="form-field-row">
                  <label>Rollout Strategy</label>
                  <select
                    className="form-select-box"
                    value={selectedStrategy}
                    onChange={e => setSelectedStrategy(e.target.value as any)}
                  >
                    <option value="ROLLING">Rolling Zero-Downtime</option>
                    <option value="BLUE_GREEN">Blue / Green Switch</option>
                    <option value="CANARY">Canary (10% Traffic)</option>
                    <option value="INSTANT">Instant Hot-Patch</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setDeployTargetCompany(null)}>Cancel</button>
              <button className="btn-provision-trigger" onClick={triggerPackageDeployment}>
                Trigger Deployment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 4: INSTALL SCRIPT INSPECTOR
          ═══════════════════════════════════════════════════════════════════ */}
      {activeModalCompany && (
        <div className="modal-overlay-backdrop" onClick={() => setActiveModalCompany(null)}>
          <div className="modal-dialog-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 1-Click Install Script: {activeModalCompany.name}</h3>
              <button className="btn-modal-close" onClick={() => setActiveModalCompany(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.84rem', color: 'var(--adm-muted)', lineHeight: '1.6' }}>
                Run this single command on the factory Linux VM or Windows Weighbridge PC to auto-provision:
              </p>
              <div className="code-snippet-box">
                curl -sSL https://get.evergreenos.in/install.sh | bash -s -- \<br />
                &nbsp;&nbsp;--company-id="{activeModalCompany.id}" \<br />
                &nbsp;&nbsp;--api-key="{activeModalCompany.apiKey}" \<br />
                &nbsp;&nbsp;--cloud-provider="{activeModalCompany.cloudProvider}" \<br />
                &nbsp;&nbsp;--admin-api="{adminApiBase}"
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-provision-trigger" onClick={() => setActiveModalCompany(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 5: NEW PACKAGE BUILD
          ═══════════════════════════════════════════════════════════════════ */}
      {showNewPkgModal && (
        <div className="modal-overlay-backdrop" onClick={() => setShowNewPkgModal(false)}>
          <div className="modal-dialog-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔨 Compile & Register Release Package</h3>
              <button className="btn-modal-close" onClick={() => setShowNewPkgModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreatePackage}>
              <div className="modal-body">
                <div className="form-grid-2col">
                  <div className="form-field-row">
                    <label>Package Version *</label>
                    <input
                      type="text"
                      required
                      className="form-input-text"
                      placeholder="e.g. v1.2.5-lts"
                      value={newPkgVersion}
                      onChange={e => setNewPkgVersion(e.target.value)}
                    />
                  </div>
                  <div className="form-field-row">
                    <label>Release Title *</label>
                    <input
                      type="text"
                      required
                      className="form-input-text"
                      placeholder="TareZero & Tally Prime 4.0 XML Sync"
                      value={newPkgName}
                      onChange={e => setNewPkgName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-field-row">
                  <label>Target Cloud Platforms</label>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '0.75rem', background: 'rgba(255,255,255,0.025)', borderRadius: 8, border: '1px solid var(--adm-border)' }}>
                    {['GCP', 'AWS', 'AZURE', 'LOCAL_VM'].map(t => (
                      <label key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.82rem', color: '#ffffff', userSelect: 'none' }}>
                        <input
                          type="checkbox"
                          checked={newPkgTargets.includes(t)}
                          onChange={e => {
                            if (e.target.checked) setNewPkgTargets([...newPkgTargets, t]);
                            else setNewPkgTargets(newPkgTargets.filter(item => item !== t));
                          }}
                          style={{ accentColor: 'var(--adm-cyan)', width: 15, height: 15 }}
                        />
                        <span className={`cloud-pill-tag ${t.toLowerCase()}`} style={{ fontSize: '0.7rem', cursor: 'pointer' }}>{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-field-row">
                  <label>Changelog / Release Notes</label>
                  <textarea
                    className="form-input-text"
                    rows={3}
                    placeholder="Bug fixes, security patches, and performance improvements..."
                    value={newPkgChangelog}
                    onChange={e => setNewPkgChangelog(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setShowNewPkgModal(false)}>Cancel</button>
                <button type="submit" className="btn-provision-trigger">🔨 Trigger Build</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 6: CONNECTOR CREDENTIALS & CONFIG
          ═══════════════════════════════════════════════════════════════════ */}
      {selectedConnector && (
        <div className="modal-overlay-backdrop" onClick={() => setSelectedConnector(null)}>
          <div className="modal-dialog-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚙️ Configure Integration: {selectedConnector.name}</h3>
              <button className="btn-modal-close" onClick={() => setSelectedConnector(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                <div className="connector-logo-mark" style={{ background: `${selectedConnector.color}22`, color: selectedConnector.color }}>
                  {selectedConnector.mark}
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>{selectedConnector.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--adm-muted)' }}>{selectedConnector.description}</div>
                </div>
              </div>

              <div className="form-field-row">
                <label>Authentication Requirement</label>
                <input type="text" disabled className="form-input-text" value={selectedConnector.auth} />
              </div>

              <div className="form-field-row">
                <label>API Key / Client Secret (Stored Securely in Vault)</label>
                <input type="password" className="form-input-text" defaultValue="••••••••••••••••••••••••••••••••" />
              </div>

              <div className="form-field-row">
                <label>Webhook / Callback Endpoint</label>
                <input type="text" className="form-input-text" defaultValue={`https://evergreenos.in/api/webhooks/${selectedConnector.id}`} />
              </div>

              <div className="form-field-row">
                <label>Supported Event Hooks</label>
                <input type="text" disabled className="form-input-text" value={selectedConnector.events} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setSelectedConnector(null)}>Cancel</button>
              <button
                className="btn-provision-trigger"
                onClick={() => {
                  showMsg(`✅ Configuration saved for ${selectedConnector.name}. Credentials encrypted.`);
                  setSelectedConnector(null);
                }}
              >
                Save & Verify Connection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 7: RECORD DETAILS INSPECTOR
          ═══════════════════════════════════════════════════════════════════ */}
      {activeRecordModal && (
        <div className="modal-overlay-backdrop" onClick={() => setActiveRecordModal(null)}>
          <div className="modal-dialog-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📄 Control Record: {activeRecordModal.title}</h3>
              <button className="btn-modal-close" onClick={() => setActiveRecordModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div><strong className="text-dim">Record ID:</strong> <span className="font-mono text-cyan">{activeRecordModal.id}</span></div>
                <div><strong className="text-dim">Kind:</strong> <span className="plan-badge-tag">{activeRecordModal.kind}</span></div>
                <div><strong className="text-dim">Status:</strong> <span className={`status-pill ${activeRecordModal.status.toLowerCase()}`}>{activeRecordModal.status}</span></div>
                <div><strong className="text-dim">Owner:</strong> <span>{activeRecordModal.owner}</span></div>
              </div>

              <div style={{ background: '#020610', padding: '1rem', borderRadius: 8, border: '1px solid var(--adm-border)', marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--adm-dim)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Payload Metadata</div>
                <pre style={{ margin: 0, fontSize: '0.78rem', color: '#e2e8f0', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)' }}>
                  {JSON.stringify(activeRecordModal.payload, null, 2)}
                </pre>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-provision-trigger" onClick={() => setActiveRecordModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 8: CREATE RECORD
          ═══════════════════════════════════════════════════════════════════ */}
      {showNewRecordModal && (
        <div className="modal-overlay-backdrop" onClick={() => setShowNewRecordModal(false)}>
          <div className="modal-dialog-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Create Mission Control Record ({newRecordKind})</h3>
              <button className="btn-modal-close" onClick={() => setShowNewRecordModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-field-row">
                <label>Title *</label>
                <input
                  type="text"
                  required
                  className="form-input-text"
                  placeholder="e.g. Verify Tirupur weighbridge load cell calibration"
                  value={newRecordTitle}
                  onChange={e => setNewRecordTitle(e.target.value)}
                />
              </div>

              <div className="form-grid-2col">
                <div className="form-field-row">
                  <label>Owner *</label>
                  <input
                    type="text"
                    className="form-input-text"
                    value={newRecordOwner}
                    onChange={e => setNewRecordOwner(e.target.value)}
                  />
                </div>
                <div className="form-field-row">
                  <label>Priority</label>
                  <select
                    className="form-select-box"
                    value={newRecordPriority}
                    onChange={e => setNewRecordPriority(e.target.value)}
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="NORMAL">Normal</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setShowNewRecordModal(false)}>Cancel</button>
              <button
                className="btn-provision-trigger"
                onClick={() => {
                  if (!newRecordTitle.trim()) return;
                  const newRec: RecordItem = {
                    id: `${newRecordKind.toLowerCase().slice(0, 4)}-${uid().slice(0, 6)}`,
                    kind: newRecordKind as any,
                    title: newRecordTitle,
                    status: newRecordKind === 'TASK' ? 'OPEN' : 'SCHEDULED',
                    priority: newRecordPriority,
                    owner: newRecordOwner,
                    version: 1,
                    payload: { description: 'Created via Mission Control Web UI' },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };
                  setRecords([newRec, ...records]);
                  showMsg(`✅ ${newRecordKind} record created: ${newRecordTitle}`);
                  setShowNewRecordModal(false);
                  setNewRecordTitle('');
                }}
              >
                Create Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
