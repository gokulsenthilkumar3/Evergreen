import AiAssistant from '../../../packages/portal-ui/AiAssistant';
import MarketingSettings from './MarketingSettings';
import DatabaseWorkspace from './DatabaseWorkspace';
import CustomerApiConsole from './CustomerApiConsole';
import OperationsOverview from './OperationsOverview';
import RecordedServices from './RecordedServices';
import './overview.css';
import WorkspacePreferences from './WorkspacePreferences';
import ProviderAccessGate from './ProviderAccessGate';
import InstallationGate from './InstallationGate';
import { useEffect, useState, useMemo, useRef } from 'react';
import './App.css';
import './layout.css';
import './motion.css';
import './redesign/redesign.css';
import './studio.css';
import './comment-motion.css';
import SceneGallery from './redesign/SceneGallery';
import EnvPill from './redesign/EnvPill';
import OperationTools from './redesign/OperationTools';
import ProofBadge from './redesign/ProofBadge';
import ProofLedger from './redesign/ProofLedger';
import DataExplorer from './redesign/DataExplorer';
import Inspector from './redesign/Inspector';
import type { Inspection } from './redesign/Inspector';
import CommandPalette from './redesign/CommandPalette';
import Topology from './redesign/Topology';
import CapabilityView from './redesign/CapabilityView';
import { WorkspaceIcon } from './WorkspaceIcon';
import { AdminModal } from './AdminModal';
import {
  money,
  STATES,
  uid
} from './control-data';
import type { RecordItem, Kind } from './control-data';

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
  runUrl?: string;
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
  | 'MARKETING_SETTINGS'
  | 'APIS'
  | 'WEBHOOKS'
  | 'INTEGRATIONS'
  | 'PAYMENTS'
  | 'AGREEMENTS'
  | 'TASKS'
  | 'AI_AGENT'
  | 'CHAT'
  | 'SCRIPTS'
  | 'LOGS' | 'PROOF' | 'TOPOLOGY' | 'PROVISIONING' | 'ACCESS' | 'KEYS' | 'BACKUPS' | 'SLOS' | 'EXPLORER' | 'JOBS';

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

/* ─────────────────────────────────────────────────────────────────────────── */
/*  MAIN APP COMPONENT                                                          */
/* ─────────────────────────────────────────────────────────────────────────── */
function App() {
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [rollbackTarget,setRollbackTarget]=useState<string|null>(null);
  const closeInspection = useMemo(() => () => setInspection(null), []);
  useEffect(() => {
    const listener = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setPaletteOpen(open => !open); } };
    window.addEventListener('keydown', listener); return () => window.removeEventListener('keydown', listener);
  }, []);
  const [activeCategory, setActiveCategory] = useState<NavCategory>('ALL');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState<TabId>('DASHBOARD');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDataResponse, setLastDataResponse] = useState('');
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


  // Modals
  const [activeModalCompany, setActiveModalCompany] = useState<Company | null>(null);
  const [deployTargetCompany, setDeployTargetCompany] = useState<Company | null>(null);
  const [reactivateTargetCompany, setReactivateTargetCompany] = useState<Company | null>(null);
  const [reactivateUtr, setReactivateUtr] = useState<string>('');
  const [reactivatePeriod, setReactivatePeriod] = useState<'1_YEAR' | '30_DAYS'>('1_YEAR');
  const [reactivating, setReactivating] = useState(false);
  const [selectedPackageToDeploy, setSelectedPackageToDeploy] = useState<string>('');
  const [deploying, setDeploying] = useState(false);
  const deployingRef = useRef(false);
  const deploymentRequestRef = useRef<{ fingerprint: string; key: string } | null>(null);
  const [building, setBuilding] = useState(false);
  const buildingRef = useRef(false);
  const buildRequestRef = useRef<{ fingerprint: string; key: string } | null>(null);

  const [showNewPkgModal, setShowNewPkgModal] = useState(false);
  const [newPkgVersion, setNewPkgVersion] = useState('');
  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgChangelog, setNewPkgChangelog] = useState('');
  const newPkgTargets = ['WINDOWS', 'DOCKER'];

  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const provisioningRef = useRef(false);
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

  // Terminal & Bash Executor state
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    'Provider console. Commands read the provider API; nothing runs on customer installations.',
    'Type "help" for commands.',
  ]);
  const [terminalInput, setTerminalInput] = useState<string>('');

  // ChatOps state
  const [chatChannel, setChatChannel] = useState<string>('operations');
  const [chatInput, setChatInput] = useState<string>('');
  const chatMessages = useMemo(() => records.filter(r => r.kind === 'CHAT').map(r => ({ id: r.id, channel: String(r.payload.channel || 'operations'), user: r.owner, role: 'Provider operator', text: String(r.payload.message || r.title), time: new Date(r.createdAt).toLocaleString() })), [records]);

  // Modals for Record details
  const setActiveRecordModal = (record:RecordItem) => setInspection({id:record.id,title:record.title,type:record.kind,proof:record.proof,data:record,at:record.updatedAt});
  const [showNewRecordModal, setShowNewRecordModal] = useState<boolean>(false);
  const [newRecordKind, setNewRecordKind] = useState<string>('TASK');
  const [newRecordTitle, setNewRecordTitle] = useState<string>('');
  const [newRecordOwner, setNewRecordOwner] = useState<string>('Evergreen Ops');
  const [newRecordPriority, setNewRecordPriority] = useState<string>('NORMAL');
  const [newRecordPayload, setNewRecordPayload] = useState('{}');
  const [savingRecord, setSavingRecord] = useState(false);

  const adminApiBase = (import.meta as any).env?.VITE_ADMIN_API_URL || '/admin-api';
  const authFetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers || {});

    return fetch(input, { ...init, headers, credentials: 'same-origin', signal: init?.signal || AbortSignal.timeout(15000) }).then(response => {
      if (response.status === 401) { sessionStorage.removeItem('evergreen_provider_key'); window.dispatchEvent(new Event('evergreen:provider-locked')); }
      return response;
    });
  };

  /* ──── DATA FETCHING ──── */
  const [dataErrors, setDataErrors] = useState<Record<string, string>>({});
  const reportDataError = (section: string, message = '') =>
    setDataErrors(previous => ({ ...previous, [section]: message }));
  const fetchCompanies = async () => {
    try {
      const res = await authFetch(`${adminApiBase}/companies`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setCompanies(await res.json());
      setLastDataResponse(new Date().toISOString());
      reportDataError('Mills');
    } catch {
      reportDataError('Mills', 'Mill data is unavailable. Previously loaded data may be stale.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    try {
      const res = await authFetch(`${adminApiBase}/control/records`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setRecords(await res.json());
      reportDataError('Records');
    } catch {
      reportDataError('Records', 'Control records are unavailable. Previously loaded data may be stale.');
    }
  };

  const fetchCicdData = async () => {
    try {
      const [resPkg, resDep, resLogs] = await Promise.all([
        authFetch(`${adminApiBase}/cicd/releases`),
        authFetch(`${adminApiBase}/cicd/deployments`),
        authFetch(`${adminApiBase}/cicd/logs?limit=100`),
      ]);
      if (!resPkg.ok || !resDep.ok || !resLogs.ok) throw new Error('CI/CD data unavailable');
      setPackages(await resPkg.json());
      setDeployments(await resDep.json());
      setLogs(await resLogs.json());
      reportDataError('CI/CD');
    } catch {
      reportDataError('CI/CD', 'Release and deployment data are unavailable. Previously loaded data may be stale.');
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchRecords();
    fetchCicdData();
    const interval = setInterval(() => {
      if (document.hidden) return;
      fetchCompanies();
      fetchCicdData();
      fetchRecords();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  /* ──── ACTIONS ──── */
  const showMsg = (msg: string, autoHide = true) => {
    setActionMessage(msg);
    if (autoHide) setTimeout(() => setActionMessage(null), 5000);
  };

  const executeReactivation = async (company: Company) => {
    if (reactivating) return;
    setReactivating(true);
    try {
      showMsg(`Saving license settings for ${company.name}...`, false);
      const nextExpiry = new Date(Math.max(Date.now(), company.expiresAt ? Date.parse(company.expiresAt) || 0 : 0));
      if (reactivatePeriod === '1_YEAR') {
        nextExpiry.setFullYear(nextExpiry.getFullYear() + 1);
      } else {
        nextExpiry.setDate(nextExpiry.getDate() + 30);
      }

      const res = await authFetch(`${adminApiBase}/companies/${company.id}/license`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ACTIVE',
          expiresAt: nextExpiry.toISOString(),
          graceExpiresAt: null,
          details: reactivateUtr.trim()
            ? `Operator renewal request; payment reference: ${reactivateUtr.trim()}`
            : 'Operator renewal request; no payment reference supplied',
        }),
      });

      if (res.ok) {
        showMsg(`License settings saved for ${company.name}. Tenant synchronization is not yet confirmed.`);
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
      setReactivating(false);
    }
  };

  const executeRemoteAction = async (companyId: string, actionType: string) => {
    try {
      showMsg(`Executing ${actionType}...`, false);
      const res = await authFetch(`${adminApiBase}/companies/${companyId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType }),
      });
      if (res.ok) {
        showMsg(`Action ${actionType} request recorded. Tenant execution is not confirmed.`);
        fetchCompanies();
        fetchCicdData();
      } else {
        showMsg(`Remote action unavailable (HTTP ${res.status}).`);
      }
    } catch {
      showMsg(`❌ Remote action execution failed.`);
    }
  };

  const triggerPackageDeployment = async () => {
    const version = selectedPackageToDeploy || packages[0]?.version;
    if (!deployTargetCompany || !version || deployingRef.current) return;
    const fingerprint = JSON.stringify([deployTargetCompany.id, version]);
    if (deploymentRequestRef.current?.fingerprint !== fingerprint) deploymentRequestRef.current = { fingerprint, key: crypto.randomUUID() };
    deployingRef.current = true;
    setDeploying(true);
    try {
      showMsg(`Requesting deployment of ${version} to ${deployTargetCompany.name}...`, false);
      const res = await authFetch(`${adminApiBase}/cicd/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: deployTargetCompany.id,
          packageVersion: version,
          strategy: 'MAINTENANCE',
          requestKey: deploymentRequestRef.current.key,
        }),
      });
      if (res.ok) {
        const job = await res.json();
        showMsg(job.status === 'UNKNOWN'
          ? `Deployment ${job.id} needs verification: dispatch acknowledgement was lost. Check the workflow before retrying.`
          : `Deployment ${job.id} is ${job.status.toLowerCase()}. Completion will appear after the workflow health checks.`, false);
        fetchCicdData();
        fetchCompanies();
        setDeployTargetCompany(null);
      } else {
        const error = await res.json().catch(() => ({}));
        showMsg(error.message || `Deployment request failed (HTTP ${res.status}). Check the deployment history before retrying.`);
      }
    } catch {
      showMsg('The deployment response was lost. Check the deployment history; retrying the unchanged request reuses its request key.');
    } finally {
      deployingRef.current = false;
      setDeploying(false);
    }
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (buildingRef.current) return;
    const fingerprint = JSON.stringify([newPkgVersion, newPkgName, newPkgChangelog, newPkgTargets]);
    if (buildRequestRef.current?.fingerprint !== fingerprint) buildRequestRef.current = { fingerprint, key: crypto.randomUUID() };
    buildingRef.current = true;
    setBuilding(true);
    try {
      showMsg(`🔨 Building release package ${newPkgVersion}...`, false);
      const res = await authFetch(`${adminApiBase}/cicd/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: newPkgVersion,
          name: newPkgName,
          changelog: newPkgChangelog,
          targets: newPkgTargets,
          requestKey: buildRequestRef.current.key,
        }),
      });
      if (res.ok) {
        const job = await res.json();
        showMsg(`Release job ${job.id}: ${job.status}. The release appears in the registry after the build and publication complete.`, false);
        setShowNewPkgModal(false);
        setNewPkgVersion('');
        setNewPkgName('');
        setNewPkgChangelog('');
        fetchCicdData();
      } else {
        showMsg(`Build unavailable (HTTP ${res.status}). No release was created.`);
      }
    } catch {
      showMsg('The release response was lost. Check the workflow before retrying the unchanged request.');
    } finally {
      buildingRef.current = false;
      setBuilding(false);
    }
  };

  const handleProvisionTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (provisioningRef.current) return;
    provisioningRef.current = true;
    setProvisioning(true);
    try {
      showMsg(`Registering company ${name}...`, false);
      const res = await authFetch(`${adminApiBase}/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
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
        showMsg(`Company "${name}" registered. Deployment has not been started.`, false);
        setShowProvisionModal(false);
        setName('');
        setUrl('');
        fetchCompanies();
        fetchCicdData();
      } else {
        showMsg(`Company registration failed (HTTP ${res.status}). Review the details and try again.`, false);
      }
    } catch {
      showMsg('Company registration could not be confirmed. Refresh the mill list before retrying to avoid a duplicate.', false);
    } finally {
      provisioningRef.current = false;
      setProvisioning(false);
    }
  };


  // Every line printed here must come from a provider API response or say plainly
  // that nothing ran. Never report an operation that was not performed (UI-003).
  const readProviderJson = async (path: string) => {
    const res = await authFetch(`${adminApiBase}${path}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  const runTerminalCommand = async (cmd: string): Promise<string[]> => {
    if (cmd === 'help') {
      return [
        'Available commands:',
        '  health   - Provider API and database status',
        '  status   - Provider API uptime and memory, plus loaded company count',
        '  db       - Provider database record counts',
        '  clear    - Clear this window',
        'Not available here: backup, weighbridge, deploy. These print what to do instead.',
      ];
    }
    if (cmd === 'health') {
      const health = await readProviderJson('/health');
      return [
        `Provider API: ${health.status} (${health.service})`,
        `Database: ${health.database?.status ?? 'unknown'}, ${health.database?.tenantsManaged ?? 0} companies`,
        `Checked at ${health.timestamp}`,
        'Customer installations are not probed from here; their status is not known to this console.',
      ];
    }
    if (cmd === 'status') {
      const health = await readProviderJson('/status');
      return [
        `Uptime: ${health.uptimeSeconds}s | Heap: ${health.memory?.heapUsedMB}/${health.memory?.heapTotalMB} MB | RSS: ${health.memory?.rssMB} MB`,
        `Companies loaded in this workspace: ${companies.length}`,
      ];
    }
    if (cmd === 'db' || cmd === 'db-ping') {
      const db = await readProviderJson('/control/database');
      return [`${db.scope} (${db.engine}): ${db.companies} companies, ${db.records} control records, ${db.auditEvents} audit events`];
    }
    if (cmd === 'backup') {
      return [
        'Not available: the provider API has no backup endpoint, so no snapshot was taken.',
        'Take an online snapshot on the server with sqlite3 ".backup" and record its checksum (docs/MAINTENANCE_RUNBOOK.md).',
      ];
    }
    if (cmd === 'weighbridge') {
      return ['Not available: this console has no connection to weighbridge devices. No reading was taken.'];
    }
    if (cmd.startsWith('deploy')) {
      return ['Not available: no deployment worker is configured. Nothing was deployed.'];
    }
    return [`Unknown command "${cmd}". Nothing was run. Type "help" for the list.`];
  };

  const handleRunTerminalCommand = async (cmdText?: string) => {
    const cmd = (cmdText || terminalInput).trim();
    if (!cmd) return;
    setTerminalInput('');
    if (cmd === 'clear') {
      setTerminalHistory(['Provider console cleared.']);
      return;
    }
    let output: string[];
    try {
      output = await runTerminalCommand(cmd);
    } catch (error) {
      output = [`Failed: the provider API did not answer (${error instanceof Error ? error.message : 'network error'}). Nothing is assumed.`];
    }
    setTerminalHistory(prev => [...prev, `$ ${cmd}`, ...output]);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || savingRecord) return;
    setSavingRecord(true);
    try {
      const response = await authFetch(adminApiBase + '/control/records', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'CHAT', title: chatInput.trim().slice(0,200), payload: { channel: chatChannel, message: chatInput.trim() }, status: 'POSTED', requestKey: uid() }) });
      if (!response.ok) throw new Error('Chat message could not be saved');
      const saved = await response.json(); setRecords(prev => [saved,...prev]); setChatInput('');
    } catch(e) { showMsg(e instanceof Error ? e.message : 'Chat save failed'); }
    finally { setSavingRecord(false); }
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


    return {
      totalMills, activeMills, graceMills, suspendedMills,
      gcpCount, awsCount, azureCount, vmCount,
      totalStaff, totalMaxUsers, totalMachines,
      totalDocsPosted, totalMaxDocs,
    };
  }, [companies]);

  const filteredCompanies = useMemo(() =>
    companies.filter(c => {
      const matchCloud = cloudFilter === 'ALL' || c.cloudProvider === cloudFilter;
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchSearch =
        !searchQuery ||
        [c.name, c.id, c.tier].some(value => value?.toLowerCase().includes(searchQuery.trim().toLowerCase()));
      return matchCloud && matchStatus && matchSearch;
    }),
    [companies, cloudFilter, statusFilter, searchQuery]
  );


  /* ──── MODULE TABS CONFIG ──── */
  const MODULE_TABS: { id: TabId; label: string; cat: NavCategory; badge?: string; badgeColor?: string }[] = [
    { id: 'DASHBOARD', label: 'Command deck', cat: 'CORE', badge: '', badgeColor: 'cyan' },
    { id: 'TENANTS', label: 'Companies', cat: 'CORE', badge: String(companies.length), badgeColor: '' },
    { id: 'TASKS', label: 'Workboard', cat: 'CORE', badge: String(records.filter(r => r.kind === 'TASK').length), badgeColor: '' },
    { id: 'DEPLOYMENTS', label: 'Rollouts', cat: 'CLOUD', badge: String(deployments.length), badgeColor: '' },
    { id: 'PACKAGES', label: 'Release registry', cat: 'CLOUD', badge: String(packages.length), badgeColor: '' },
    { id: 'DATABASES', label: 'Storage', cat: 'CLOUD', badge: '', badgeColor: 'emerald' },
    { id: 'MARKETING_SETTINGS', label: 'Public site', cat: 'CORE' },
    { id: 'MAINTENANCE', label: 'Maintenance', cat: 'CLOUD', badge: String(records.filter(r => r.kind === 'MAINTENANCE').length), badgeColor: '' },
    { id: 'INTEGRATIONS', label: 'Connectors', cat: 'CONNECTIVITY', badge: String(records.filter(r => r.kind === 'INTEGRATION').length), badgeColor: 'cyan' },
    { id: 'APIS', label: 'Telemetry', cat: 'CONNECTIVITY', badge: '', badgeColor: '' },
    { id: 'WEBHOOKS', label: 'Event delivery', cat: 'CONNECTIVITY', badge: String(records.filter(r => r.kind === 'WEBHOOK').length), badgeColor: '' },
    { id: 'PAYMENTS', label: 'Billing ledger', cat: 'FINANCE', badge: String(records.filter(r => r.kind === 'PAYMENT').length), badgeColor: '' },
    { id: 'AGREEMENTS', label: 'Contracts', cat: 'FINANCE', badge: String(records.filter(r => r.kind === 'AGREEMENT').length), badgeColor: '' },
    { id: 'AI_AGENT', label: 'Copilot', cat: 'INTELLIGENCE', badge: 'COPILOT', badgeColor: 'purple' },
    { id: 'CHAT', label: 'Channels', cat: 'INTELLIGENCE', badge: String(chatMessages.length), badgeColor: '' },
    { id: 'SCRIPTS', label: 'Diagnostics', cat: 'INTELLIGENCE', badge: 'CLI', badgeColor: 'cyan' },
    { id: 'PROOF', label: 'Proof & audit', cat: 'CORE' },
    { id: 'TOPOLOGY', label: 'Topology', cat: 'CLOUD' },
    { id: 'PROVISIONING', label: 'Provisioning', cat: 'CLOUD' },
    { id: 'ACCESS', label: 'Access & roles', cat: 'INTELLIGENCE' },
    { id: 'KEYS', label: 'Keys & secrets', cat: 'INTELLIGENCE' },
    { id: 'BACKUPS', label: 'Backups & recovery', cat: 'CLOUD' },
    { id: 'SLOS', label: 'Monitoring & SLOs', cat: 'CONNECTIVITY' },
    { id: 'EXPLORER', label: 'Data explorer', cat: 'CLOUD' },
    { id: 'JOBS', label: 'Job queue', cat: 'CLOUD' },
    { id: 'LOGS', label: 'Log stream', cat: 'INTELLIGENCE', badge: String(logs.length), badgeColor: '' },
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
      <a className="skip-link" href="#workspace-main">Skip to content</a>

      {/* ── HEADER ── */}
      <header className="top-command-bar">
        <div className="admin-brand">
          <BrandLogo />
          <div className="brand-copy">
            <div className="brand-h1">
              EverGreen
              <span className="control-plane-badge">PROVIDER PLANE</span>
            </div>
            <span className="brand-tag">PROVIDER / EVIDENCE WORKSPACE</span>
          </div>
        </div>

        <button className="btn-ghost menu-toggle" aria-expanded={mobileNavOpen} aria-controls="workspace-navigation" onClick={() => setMobileNavOpen(open => !open)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          {mobileNavOpen ? 'Close' : 'Modules'}
        </button>

        <button className="command-trigger" onClick={() => setPaletteOpen(true)}><span>Search the workspace…</span><kbd>Ctrl K</kbd></button>
        <EnvPill apiBase={adminApiBase} />
        <div className="top-bar-stats">
          <div className="top-stat-item">
            <span className="top-stat-label">Active Mills</span>
            <span className="top-stat-value text-emerald">{metrics.activeMills}/{metrics.totalMills}</span>
          </div>
          <div className="top-stat-item">
            <span className="top-stat-label">Reported staff</span>
            <span className="top-stat-value">{metrics.totalStaff}</span>
          </div>
          <div className="top-stat-item">
            <span className="top-stat-label">Customer sync</span>
            <span className="top-stat-value text-cyan">{companies.filter(c => c.lastSyncAt).length}/{companies.length} received</span>
          </div>
          <div className="top-stat-item">
            <span className="top-stat-label">Cluster Release</span>
            <span className="top-stat-value font-mono">{packages[0]?.version || 'Not reported'}</span>
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
        <div className="action-banner" role="status">
          <span>{actionMessage}</span>
          <button className="btn-modal-close" aria-label="Close" style={{ width: 28, height: 28 }} onClick={() => setActionMessage(null)}>×</button>
        </div>
      )}

      <div className="admin-workspace" data-inspector-open={!!inspection}>
      <aside id="workspace-navigation" className={`admin-sidebar ${mobileNavOpen ? 'is-open' : ''}`}>
        <div className="sidebar-heading"><strong>Workspace</strong><span>{MODULE_TABS.length} modules</span></div>
        <label className="sidebar-category">
          Module group
          <select value={activeCategory} onChange={event => setActiveCategory(event.target.value as NavCategory)}>
            <option value="ALL">All modules</option>
            <option value="CORE">Core operations</option>
            <option value="CLOUD">Cloud & deployment</option>
            <option value="CONNECTIVITY">Connectivity</option>
            <option value="FINANCE">Finance & legal</option>
            <option value="INTELLIGENCE">AI & developer tools</option>
          </select>
        </label>
        <nav className="admin-nav-bar" aria-label="Provider modules">
          {([['CORE','OPERATE'],['CLOUD','INFRASTRUCTURE'],['CONNECTIVITY','CONNECTIVITY'],['FINANCE','FINANCE & LEGAL'],['INTELLIGENCE','TOOLS & GOVERNANCE']] as const).filter(([category]) => visibleTabs.some(tab => tab.cat === category)).map(([category,label]) => (
            <div className="studio-nav-group" key={category}><div className="studio-nav-group-label">{label}</div>
            {visibleTabs.filter(tab => tab.cat === category).map(tab => (
            <button
              key={tab.id}
              title={tab.label}
              className={`nav-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              onClick={() => {
                setActiveTab(tab.id);
                setMobileNavOpen(false);
                requestAnimationFrame(() => mainRef.current?.focus());
              }}
            >
              <WorkspaceIcon name={tab.id} />
              <span className="nav-label">{tab.label}</span>
              {tab.badge && <span className={`tab-badge ${tab.badgeColor || ''}`}>{tab.badge}</span>}
            </button>
          ))}</div>))}
        </nav>
        <div className="sidebar-footer">EverGreen · Provider workspace</div>
      </aside>

      {/* ── MAIN VIEWPORT ── */}
      <main id="workspace-main" ref={mainRef} tabIndex={-1} className="admin-main-viewport">
        <WorkspacePreferences />
        {Object.entries(dataErrors).filter(([, message]) => message).map(([section, message]) => (
          <p key={section} role="alert">{message}</p>
        ))}
        <div className="workspace-context"><span>Provider workspace</span><span aria-hidden="true">/</span><span>{MODULE_TABS.find(tab => tab.id === activeTab)?.label}</span></div>
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p style={{ color: 'var(--adm-muted)', fontSize: '0.9rem' }}>
              Reading provider records…
            </p>
          </div>
        ) : (
          <>
            {/* ═══════════════════════════════════════════════════════════════
                TAB 1: EXECUTIVE DASHBOARD (CUSTOMIZABLE)
                ═══════════════════════════════════════════════════════════════ */}
{activeTab === 'PROOF' && <ProofLedger apiBase={adminApiBase} onInspect={event => setInspection({id:event.entityId,title:event.title,type:event.entityType,proof:event.proof,data:event,at:event.at})} />}
            {activeTab === 'EXPLORER' && <DataExplorer apiBase={adminApiBase} />}
            {activeTab === 'TOPOLOGY' && <Topology companies={companies} apiBase={adminApiBase} onInspect={setInspection} />}
            {activeTab === 'DEPLOYMENTS' && rollbackTarget && <OperationTools apiBase={adminApiBase} kind="rollback" entityId={rollbackTarget} />}
            {activeTab === 'JOBS' && <ProofLedger apiBase={adminApiBase} jobsOnly onInspect={event => setInspection({id:event.entityId,title:event.title,type:'JOB',proof:event.proof,data:event,at:event.at})} />}
            {['PROVISIONING','ACCESS','KEYS','BACKUPS','SLOS'].includes(activeTab) && <CapabilityView id={activeTab} apiBase={adminApiBase} />}
            {activeTab === 'DASHBOARD' && <OperationsOverview companies={companies} records={records} updatedAt={lastDataResponse} onRefresh={() => { void fetchCompanies(); void fetchRecords(); }} onNavigate={setActiveTab} onInspect={company => setInspection({id:company.id,title:company.name,type:'COMPANY',data:company})} />}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 2: SPINNING MILL TENANTS & LICENSES
                ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'TENANTS' && (
              <div className="tenants-tab-view">
                <div className="page-toolbar"><div><h1 className="page-title">Companies</h1><p className="page-description">Manage tenant licenses, capacity, and cloud deployments.</p></div><span className="plan-badge-tag">{filteredCompanies.length} of {companies.length} mills</span></div>
                {/* TOOLBAR */}
                <div className="tenants-toolbar-card">
                  <div className="toolbar-search-box">
                    <span className="search-icon">🔍</span>
                    <input
                      aria-label="Search spinning mills"
                      type="search"
                      className="search-input-field"
                      placeholder="Search spinning mills by name, tenant ID, or cluster..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button className="search-clear-btn" aria-label="Clear search" onClick={() => setSearchQuery('')}>×</button>
                    )}
                  </div>

                  <div className="toolbar-filters-group">
                    <select
                      className="filter-select-box"
                      aria-label="Cloud provider"
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
                      aria-label="License status"
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                    >
                      <option value="ALL">All License Statuses</option>
                      <option value="ACTIVE">ACTIVE (Fully Licensed)</option>
                      <option value="GRACE_PERIOD">GRACE_PERIOD</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                    </select>
                  </div>
                </div>

                {/* TENANTS TABLE */}
                <div className="glass-panel tenants-table-container" role="region" aria-label="Scrollable records" tabIndex={0}>
                  <table className="tenants-data-table">
                    <thead>
                      <tr>
                        <th>Mill Tenant</th>
                        <th>Cloud Provider</th>
                        <th>License Plan</th>
                        <th>Status</th>
                        <th>Version</th>
                        <th>Staff & machine quota</th>
                        <th>Monthly Docs</th>
                        <th>Remote Ops</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCompanies.length === 0 && (
                        <tr><td colSpan={9} className="empty-state"><p>No mills match these filters.</p><button className="btn-ghost" onClick={() => { setSearchQuery(''); setCloudFilter('ALL'); setStatusFilter('ALL'); }}>Clear filters</button></td></tr>
                      )}
                      {filteredCompanies.map(c => {
                        const isGrace = c.status === 'GRACE_PERIOD';
                        return (
                          <tr key={c.id} className={isGrace ? 'row-grace-warning' : ''}>
                            <td>
                              <div className="tenant-cell-name">
                                <button className="row-inspect" onClick={() => setInspection({id:c.id,title:c.name,type:'COMPANY',data:{id:c.id,name:c.name,cloudProvider:c.cloudProvider,status:c.status,plan:c.plan,lastSyncAt:c.lastSyncAt}})}><strong>{c.name}</strong></button><ProofBadge />
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
                                <div style={{ color: 'var(--adm-dim)', fontSize: '0.7rem' }}>{c.maxMachines} machines allowed</div>
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
                                    Renew license
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
                <div className="page-toolbar">
                  <div>
                    <h1 className="page-title">Tasks</h1>
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

                <div className="task-board">
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
                            <button type="button" className="task-card"
                              key={t.id}
                              style={{ background: 'var(--adm-card)', border: '1px solid var(--adm-border)', borderRadius: 8, padding: '0.85rem', cursor: 'pointer', transition: 'all 0.15s' }}
                              onClick={() => setInspection({id:t.id,title:t.title,type:t.kind,proof:t.proof,data:t,at:t.updatedAt})}
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
                            </button>
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
                <div className="page-toolbar">
                  <div>
                    <h1 className="page-title">Rollouts</h1>
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

                <div className="glass-panel tenants-table-container" role="region" aria-label="Scrollable records" tabIndex={0}>
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
                          <td><span className="font-mono text-cyan" style={{ fontSize: '0.76rem' }}>{d.id}</span><button className="btn-table-action" onClick={()=>setRollbackTarget(d.id)}>Request rollback</button>{d.runUrl && <div><a href={d.runUrl} target="_blank" rel="noreferrer">View workflow</a></div>}</td>
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
                <div className="page-toolbar">
                  <div>
                    <h1 className="page-title">Release registry</h1>
                    <p style={{ fontSize: '0.82rem', color: 'var(--adm-muted)' }}>Immutable multi-cloud binaries, Docker images, and RS-232 weighbridge drivers</p>
                  </div>
                  <button className="btn-provision-trigger" onClick={() => setShowNewPkgModal(true)}>
                    + Compile Release Package
                  </button>
                </div>

                <div className="record-card-grid">
                  {packages.map(p => (
                    <div key={p.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--adm-cyan)' }}>{p.version}</span>
                            <span style={{fontSize:'0.65rem'}}>{p.status}</span><ProofBadge/>
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
                        {p.changelog || 'See the published release for changes and acceptance evidence.'}
                      </p>

                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.6rem 0.8rem', borderRadius: 6, fontSize: '0.72rem', color: 'var(--adm-dim)' }}>
                        <div>Commit: <span className="font-mono text-cyan">{p.commit}</span> on <span className="font-mono">{p.branch}</span></div>
                        <div>Artifacts: {p.artifacts?.length || 0} published file(s)</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 6: DATABASE STUDIO & MANAGEMENT
                ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'DATABASES' && <DatabaseWorkspace apiBase={adminApiBase} />}
            {activeTab === 'MARKETING_SETTINGS' && <MarketingSettings apiBase={adminApiBase} />}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 7: MAINTENANCE & SLA
                ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'MAINTENANCE' && (
              <div className="maintenance-tab-view">
                <div className="page-toolbar">
                  <div>
                    <h1 className="page-title">Maintenance & SLA</h1>
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

                <div className="record-card-grid">
                  {records.filter(r => r.kind === 'MAINTENANCE').map(m => (
                    <div key={m.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="font-mono text-cyan" style={{ fontSize: '0.74rem' }}>{m.id}</span>
                        <span>{m.status}</span><ProofBadge proof={m.proof}/>
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
{activeTab === 'INTEGRATIONS' && <RecordedServices apiBase={adminApiBase} title="Integrations" kind="INTEGRATION" records={records} onInspect={setActiveRecordModal} onCreate={() => { setNewRecordKind('INTEGRATION'); setShowNewRecordModal(true); }} />}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 9: API GATEWAY MANAGEMENT
                ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'APIS' && <CustomerApiConsole apiBase={adminApiBase} />}


            {/* ═══════════════════════════════════════════════════════════════
                TAB 10: WEBHOOKS DISPATCHER & ENGINE
                ═══════════════════════════════════════════════════════════════ */}
{activeTab === 'WEBHOOKS' && <RecordedServices apiBase={adminApiBase} title="Webhooks" kind="WEBHOOK" records={records} onInspect={setActiveRecordModal} onCreate={() => { setNewRecordKind('WEBHOOK'); setShowNewRecordModal(true); }} />}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 11: PAYMENTS & UTR RECONCILIATION
                ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'PAYMENTS' && (
              <div className="payments-tab-view">
                <div className="page-toolbar">
                  <div>
                    <h1 className="page-title">Billing ledger</h1>
                    <p style={{ fontSize: '0.82rem', color: 'var(--adm-muted)' }}>Recorded payments and evidence for operator review</p>
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

                <div className="glass-panel tenants-table-container" role="region" aria-label="Scrollable records" tabIndex={0}>
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
                                {money(amt)}
                              </span>
                            </td>
                            <td><span className="cloud-pill-tag">{String(p.payload?.provider || 'Not recorded')}</span></td>
                            <td><span className="font-mono text-dim">{String(p.payload?.reference || 'Not recorded')}</span></td>
                            <td><span>{p.status}</span><ProofBadge proof={p.proof}/></td>
                            <td>
                              {isPending ? (
                                <button
                                  className="btn-table-action amber"
                                  onClick={() => {
                                    setActiveRecordModal(p);
                                  }}
                                >
                                  Review evidence
                                </button>
                              ) : (
                                <span style={{ fontSize: '0.75rem' }}>Recorded: {p.status}</span>
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
                <div className="page-toolbar">
                  <div>
                    <h1 className="page-title">Contracts</h1>
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

                <div className="record-card-grid">
                  {records.filter(r => r.kind === 'AGREEMENT').map(a => (
                    <div key={a.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#ffffff' }}>{a.title}</div>
                          <span className="font-mono text-cyan" style={{ fontSize: '0.72rem' }}>{a.id}</span>
                        </div>
                        <span>{a.status}</span><ProofBadge proof={a.proof}/>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--adm-muted)', lineHeight: '1.5' }}>
                        {String(a.payload?.description || 'Description not recorded')}
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.6rem 0.8rem', borderRadius: 6, fontSize: '0.74rem', color: 'var(--adm-dim)' }}>
                        <div>Legal Entity: <span style={{ color: '#ffffff' }}>{String(a.payload?.legalEntity || 'Not recorded')}</span></div>
                        <div>Reference: <span className="font-mono text-cyan">{String(a.payload?.reference || 'Not recorded')}</span></div>
                        <div>Due / Expiry: {a.dueAt ? new Date(a.dueAt).toLocaleDateString() : 'Not recorded'}</div>
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
            {activeTab === 'AI_AGENT' && <section><div className="page-toolbar"><div><p className="workspace-eyebrow">OWNER / INTELLIGENCE</p><h1 className="page-title">Copilot</h1><p className="workspace-subtitle">Atlas uses Groq for guidance and drafting. It cannot run commands, inspect tenant data or change records.</p></div></div><AiAssistant endpoint={adminApiBase + '/ai/owner'} title="Atlas" purpose="Owner operations, deployment planning and licence guidance" prompts={['How do I issue a licence with an offline period?', 'Prepare a deployment and recovery checklist.', 'Explain provider roles and secure owner access.']} /></section>}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 14: CHATOPS LIVE FEED
                ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'CHAT' && (
              <div className="chat-tab-view">
                <div className="page-toolbar">
                  <div>
                    <h1 className="page-title">Channels</h1>
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
                      <label>Channel<input className="form-input-text" value={chatChannel} onChange={e => setChatChannel(e.target.value.replace(/[^a-z0-9-]/gi,'').slice(0,80))} /></label>
{[...new Set(['operations', chatChannel, ...chatMessages.map(message => message.channel)])].map(id => ({ id, name: `#${id}` })).map(ch => (
                        <button type="button" aria-pressed={chatChannel === ch.id}
                          key={ch.id}
                          className={`chat-channel-item ${chatChannel === ch.id ? 'active' : ''}`}
                          onClick={() => setChatChannel(ch.id)}
                        >
                          {ch.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* MESSAGES & INPUT */}
                  <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1rem' }}>
                      {chatMessages.filter(m => m.channel === chatChannel).map(msg => (
                        <div key={msg.id} style={{ background: 'rgba(255,255,255,0.025)', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--adm-border)' }}>
                          <div className="chat-message-header">
                            <div className="chat-message-author">
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

                    <form onSubmit={handleSendChat} className="chat-composer">
                      <input
                        type="text"
                        className="form-input-text"
                        placeholder={`Message #${chatChannel}...`}
                        aria-label={`Message #${chatChannel}`}
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                      />
                      <button type="submit" className="btn-provision-trigger" disabled={savingRecord}>{savingRecord ? 'Saving…' : 'Send'}</button>
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
                <div className="page-toolbar">
                  <div>
                    <h1 className="page-title">Diagnostics</h1>
                    <p style={{ fontSize: '0.82rem', color: 'var(--adm-muted)' }}>Read-only provider API checks. Backups, devices and deployments are not run from here.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="dash-widget-toggle-btn active" onClick={() => handleRunTerminalCommand('health')}>
                      🔍 health
                    </button>
                    <button className="dash-widget-toggle-btn active" onClick={() => handleRunTerminalCommand('backup')}>
                      📦 backup
                    </button>
                    <button className="dash-widget-toggle-btn active" onClick={() => handleRunTerminalCommand('db')}>
                      🗄️ db
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
                      Provider console (read-only)
                    </span>
                    <span className="font-mono text-cyan" style={{ fontSize: '0.7rem' }}>
                      Provider API
                    </span>
                  </div>

                  <div className="terminal-console-stream">
                    {terminalHistory.map((line, i) => (
                      <div key={i} style={{ color: line.startsWith('$') ? 'var(--adm-cyan)' : /^(Failed|Not available|Unknown command)/.test(line) ? 'var(--adm-rose)' : '#e2e8f0' }}>
                        {line}
                      </div>
                    ))}
                  </div>

                  <div className="terminal-input-row">
                    <span style={{ color: 'var(--adm-emerald)', fontWeight: 800, fontSize: '0.9rem' }}>$</span>
                    <input
                      type="text"
                      className="terminal-input-field" aria-label="Terminal command"
                      placeholder="Type a command (help, health, status, db)..."
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
                <div className="page-toolbar">
                  <div>
                    <h1 className="page-title">Console logs</h1>
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
                      <div key={l.id} className="log-line">
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
      {inspection && <Inspector item={inspection} apiBase={adminApiBase} onClose={closeInspection} />}
      </div>
      {paletteOpen && <CommandPalette apiBase={adminApiBase} onRemote={async result=>{try{if(result.type==='RELEASE_JOB'){setInspection({id:result.id,title:result.label,type:result.type,data:result});return}const response=await authFetch(adminApiBase+(result.type==='COMPANY'?'/companies/':'/control/records/')+encodeURIComponent(result.id));if(!response.ok)throw Error('Search record is unavailable');const row=await response.json();setInspection({id:row.id,title:row.name||row.title,type:result.type,proof:row.proof,data:row,at:row.updatedAt})}catch(e){showMsg(e instanceof Error?e.message:'Search failed')}}} onClose={() => setPaletteOpen(false)} items={[
        ...MODULE_TABS.map(tab => ({id:tab.id,label:tab.label,group:'Module',run:()=>{setActiveTab(tab.id);setMobileNavOpen(false)}})),
        ...companies.map(c => ({id:c.id,label:c.name,group:'Company',run:()=>{setActiveTab('TENANTS');setInspection({id:c.id,title:c.name,type:'COMPANY',data:{id:c.id,name:c.name,status:c.status,cloudProvider:c.cloudProvider}})}})),
        ...records.map(r => ({id:r.id,label:r.title,group:r.kind,run:()=>setInspection({id:r.id,title:r.title,type:r.kind,proof:r.proof,data:r,at:r.updatedAt})})),
      ]} />}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 1: PROVISION NEW MILL TENANT
          ═══════════════════════════════════════════════════════════════════ */}
      {showProvisionModal && (
        <AdminModal onClose={() => { if (!provisioning) setShowProvisionModal(false); }}>
          <div className="modal-dialog-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="admin-modal-title">🏢 Provision New Spinning Mill Tenant</h3>
              <button className="btn-modal-close" aria-label="Close" disabled={provisioning} onClick={() => setShowProvisionModal(false)}>×</button>
            </div>
            <form onSubmit={handleProvisionTenant}>
              <div className="modal-body">
                <div className="form-field-row">
                  <label htmlFor="company-name">Mill Company Name *</label>
                  <input
                    id="company-name"
                    maxLength={200}
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
                    <label htmlFor="company-cloud">Cloud Deployment Target *</label>
                    <select
                      id="company-cloud"
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
                    <label htmlFor="company-tier">Textile Cluster Region</label>
                    <select
                      id="company-tier"
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
                  <label htmlFor="company-state">State / Province</label>
                  <input
                    id="company-state"
                    maxLength={120}
                    type="text"
                    className="form-input-text"
                    placeholder="e.g. Tamil Nadu"
                    value={stateRegion}
                    onChange={e => setStateRegion(e.target.value)}
                  />
                </div>

                <div className="form-grid-2col">
                  <div className="form-field-row">
                    <label htmlFor="company-plan">Commercial Subscription Plan</label>
                    <select
                      id="company-plan"
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
                    <label htmlFor="company-pricing">Billing Structure</label>
                    <select
                      id="company-pricing"
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
                    <label htmlFor="company-users">Max Users (Seats)</label>
                    <input
                      id="company-users"
                      min={1} max={2147483647} step={1} required
                      type="number"
                      className="form-input-text"
                      value={maxUsers}
                      onChange={e => setMaxUsers(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-field-row">
                    <label htmlFor="company-machines">Max Machines / Spindles</label>
                    <input
                      id="company-machines"
                      min={0} max={2147483647} step={1} required
                      type="number"
                      className="form-input-text"
                      value={maxMachines}
                      onChange={e => setMaxMachines(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="form-field-row">
                  <label htmlFor="company-documents">Max Monthly Documents</label>
                  <input
                    id="company-documents"
                    min={0} max={2147483647} step={1} required
                    type="number"
                    className="form-input-text"
                    value={maxDocs}
                    onChange={e => setMaxDocs(Number(e.target.value))}
                  />
                </div>

                <div className="form-field-row">
                  <label htmlFor="company-url">Deployment URL (Optional if Factory VM)</label>
                  <input
                    id="company-url"
                    maxLength={2048}
                    type="url"
                    className="form-input-text"
                    placeholder="https://mahalakshmi.evergreenos.in"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-ghost" disabled={provisioning} onClick={() => setShowProvisionModal(false)}>Cancel</button>
                <button type="submit" className="btn-provision-trigger" disabled={provisioning}>{provisioning ? 'Registering…' : 'Register Mill'}</button>
              </div>
            </form>
          </div>
        </AdminModal>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 2: LICENSE RENEWAL
          ═══════════════════════════════════════════════════════════════════ */}
      {reactivateTargetCompany && (
        <AdminModal onClose={() => { if (!reactivating) setReactivateTargetCompany(null); }}>
          <div className="modal-dialog-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="admin-modal-title">Renew license</h3>
              <button className="btn-modal-close" aria-label="Close" disabled={reactivating} onClick={() => setReactivateTargetCompany(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="reactivation-timer-box">
                <div className="timer-details">
                  <h4>Save provider license settings</h4>
                  <p>
                    Save the renewal status and expiry date. Tenant synchronization must be confirmed separately.
                    A payment reference is an operator note; it does not verify a bank payment.
                  </p>
                </div>
              </div>

              <div className="form-field-row">
                <label htmlFor="renewal-tenant">Mill tenant</label>
                <input
                  id="renewal-tenant"
                  type="text"
                  disabled
                  className="form-input-text"
                  value={`${reactivateTargetCompany.name} (${reactivateTargetCompany.cloudProvider})`}
                />
              </div>

              <div className="form-grid-2col">
                <div className="form-field-row">
                  <label htmlFor="renewal-duration">Renewal duration</label>
                  <select
                    id="renewal-duration"
                    className="form-select-box"
                    disabled={reactivating}
                    value={reactivatePeriod}
                    onChange={e => setReactivatePeriod(e.target.value as '1_YEAR' | '30_DAYS')}
                  >
                    <option value="1_YEAR">1 Full Year (Annual Subscription Renewal)</option>
                    <option value="30_DAYS">30-Day Renewal</option>
                  </select>
                </div>
                <div className="form-field-row">
                  <label htmlFor="renewal-reference">Bank payment UTR reference (optional)</label>
                  <input
                    id="renewal-reference"
                    type="text"
                    maxLength={128}
                    disabled={reactivating}
                    className="form-input-text"
                    placeholder="e.g. HDFC202610110482"
                    value={reactivateUtr}
                    onChange={e => setReactivateUtr(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" disabled={reactivating} onClick={() => setReactivateTargetCompany(null)}>Cancel</button>
              <button
                className="btn-reactivate-lightning"
                disabled={reactivating}
                onClick={() => executeReactivation(reactivateTargetCompany)}
              >
                {reactivating ? 'Saving…' : 'Save license renewal'}
              </button>
            </div>
          </div>
        </AdminModal>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 3: CLOUD DEPLOYMENT TRIGGER
          ═══════════════════════════════════════════════════════════════════ */}
      {deployTargetCompany && (
        <AdminModal onClose={() => { if (!deployingRef.current) setDeployTargetCompany(null); }}>
          <div className="modal-dialog-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="admin-modal-title">🚀 Deploy Release to {deployTargetCompany.name}</h3>
              <button className="btn-modal-close" aria-label="Close" disabled={deploying} onClick={() => setDeployTargetCompany(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid-2col">
                <div className="form-field-row">
                  <label htmlFor="deployment-release">Release Package</label>
                  <select
                    id="deployment-release"
                    className="form-select-box"
                    value={selectedPackageToDeploy || packages[0]?.version || ''}
                    disabled={deploying || packages.length === 0}
                    onChange={e => setSelectedPackageToDeploy(e.target.value)}
                  >
                    {packages.map(p => (
                      <option key={p.id} value={p.version}>{p.version} — {p.name}</option>
                    ))}
                    {packages.length === 0 && (
                      <option value="">No published releases available</option>
                    )}
                  </select>
                </div>
                <div className="form-field-row">
                  <label>Deployment window</label>
                  <p>The app pauses while a database snapshot is migrated and checked. Previous data is retained for recovery.</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" disabled={deploying} onClick={() => setDeployTargetCompany(null)}>Cancel</button>
              <button className="btn-provision-trigger" disabled={deploying || packages.length === 0} onClick={triggerPackageDeployment}>
                {deploying ? 'Requesting deployment…' : 'Deploy release'}
              </button>
            </div>
          </div>
        </AdminModal>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 4: INSTALLATION DETAILS
          ═══════════════════════════════════════════════════════════════════ */}
      {activeModalCompany && (
        <AdminModal onClose={() => setActiveModalCompany(null)}>
          <div className="modal-dialog-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="admin-modal-title">Installation details: {activeModalCompany.name}</h3>
              <button className="btn-modal-close" aria-label="Close" onClick={() => setActiveModalCompany(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.84rem', color: 'var(--adm-muted)', lineHeight: '1.6' }}>
                Automated installation is not configured. Use a verified deployment package and the deployment runbook.
                Enrollment credentials are not included in company listings.
              </p>
              <div className="code-snippet-box">
                Company: {activeModalCompany.id}<br />
                Target: {activeModalCompany.cloudProvider}<br />
                Provider API: {adminApiBase}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-provision-trigger" onClick={() => setActiveModalCompany(null)}>Done</button>
            </div>
          </div>
        </AdminModal>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 5: NEW PACKAGE BUILD
          ═══════════════════════════════════════════════════════════════════ */}
      {showNewPkgModal && (
        <AdminModal onClose={() => { if (!buildingRef.current) setShowNewPkgModal(false); }}>
          <div className="modal-dialog-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="admin-modal-title">🔨 Compile & Register Release Package</h3>
              <button className="btn-modal-close" aria-label="Close" disabled={building} onClick={() => setShowNewPkgModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreatePackage}>
              <div className="modal-body">
                <div className="form-grid-2col">
                  <div className="form-field-row">
                    <label htmlFor="release-version">Package Version *</label>
                    <input
                      id="release-version"
                      type="text"
                      required
                      className="form-input-text"
                      placeholder="e.g. v1.0.0"
                      disabled={building}
                      pattern="v?[0-9]+\.[0-9]+\.[0-9]+"
                      value={newPkgVersion}
                      onChange={e => setNewPkgVersion(e.target.value)}
                    />
                  </div>
                  <div className="form-field-row">
                    <label htmlFor="release-title">Release Title *</label>
                    <input
                      id="release-title"
                      type="text"
                      required
                      className="form-input-text"
                      placeholder="TareZero & Tally Prime 4.0 XML Sync"
                      value={newPkgName}
                      disabled={building}
                      onChange={e => setNewPkgName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-field-row">
                  <label>Release artifacts</label>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '0.75rem', background: 'rgba(255,255,255,0.025)', borderRadius: 8, border: '1px solid var(--adm-border)' }}>
                    {newPkgTargets.map(t => (
                      <label key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.82rem', color: '#ffffff', userSelect: 'none' }}>
                        <input
                          type="checkbox"
                          checked
                          disabled
                          style={{ accentColor: 'var(--adm-cyan)', width: 15, height: 15 }}
                        />
                        <span className={`cloud-pill-tag ${t.toLowerCase()}`} style={{ fontSize: '0.7rem', cursor: 'pointer' }}>{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-field-row">
                  <label htmlFor="release-notes">Changelog / Release Notes</label>
                  <textarea
                    id="release-notes"
                    className="form-input-text"
                    rows={3}
                    placeholder="Bug fixes, security patches, and performance improvements..."
                    value={newPkgChangelog}
                    disabled={building}
                    onChange={e => setNewPkgChangelog(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" disabled={building} onClick={() => setShowNewPkgModal(false)}>Cancel</button>
                <button type="submit" className="btn-provision-trigger" disabled={building}>{building ? 'Requesting build…' : 'Trigger build'}</button>
              </div>
            </form>
          </div>
        </AdminModal>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 6: CONNECTOR CREDENTIALS & CONFIG
          ═══════════════════════════════════════════════════════════════════ */}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 7: RECORD DETAILS INSPECTOR
          ═══════════════════════════════════════════════════════════════════ */}
      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 8: CREATE RECORD
          ═══════════════════════════════════════════════════════════════════ */}
      {showNewRecordModal && (
        <AdminModal onClose={() => setShowNewRecordModal(false)}>
          <div className="modal-dialog-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="admin-modal-title">➕ Create Mission Control Record ({newRecordKind})</h3>
              <button className="btn-modal-close" aria-label="Close" onClick={() => setShowNewRecordModal(false)}>×</button>
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
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">High</option>
                    <option value="NORMAL">Normal</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <label htmlFor="record-payload">Details (JSON; use secret references, never credentials)<textarea id="record-payload" className="form-input-text" rows={5} value={newRecordPayload} onChange={e => setNewRecordPayload(e.target.value)} /></label>
              <button className="btn-ghost" disabled={savingRecord} onClick={() => setShowNewRecordModal(false)}>Cancel</button>
              <button
                className="btn-provision-trigger"
                disabled={savingRecord}
                onClick={async () => {
                  if (!newRecordTitle.trim() || savingRecord) return;
                  setSavingRecord(true);
                  try {
                    const payload = JSON.parse(newRecordPayload);
                    const response = await authFetch(adminApiBase + '/control/records', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: newRecordKind, title: newRecordTitle, status: STATES[newRecordKind as Kind]?.[0], priority: newRecordPriority, owner: newRecordOwner, payload, requestKey: uid() }) });
                    if (!response.ok) { const result = await response.json(); throw new Error(Array.isArray(result.message) ? result.message.join(', ') : result.message || 'Record save failed'); }
                    const saved = await response.json(); setRecords(prev => [saved,...prev]);
                    showMsg('Record saved to provider database'); setShowNewRecordModal(false); setNewRecordTitle(''); setNewRecordPayload('{}');
                  } catch(e) { showMsg(e instanceof Error ? e.message : 'Record save failed'); }
                  finally { setSavingRecord(false); }
                }}
              >
                {savingRecord ? 'Saving…' : 'Save to database'}
              </button>
            </div>
          </div>
        </AdminModal>
      )}

    </div>
  );
}

export default function LicensedProviderApp() { if(import.meta.env.DEV&&location.pathname.startsWith('/__scenes/'))return <SceneGallery/>; return <InstallationGate url={((import.meta as { env?: { VITE_ADMIN_API_URL?: string } }).env?.VITE_ADMIN_API_URL || '/admin-api').replace(/\/+$/, '') + '/license/status'}><ProviderAccessGate><App /></ProviderAccessGate></InstallationGate>; }
