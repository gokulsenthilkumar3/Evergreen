import { useEffect, useMemo, useState } from 'react';

type Account = {
  id: string;
  name: string;
  cloudProvider: string;
  status: string;
  subscriptionPlan: string;
  expiresAt: string | null;
  lastSyncAt: string | null;
  isMaintenance: boolean;
  plan: null | { id: string; lifecycleStage: string; summary: string | null; nextReviewAt: string | null; healthScore: number; healthBand: string; updatedAt: string };
  counts: { openMilestones: number; openRisks: number; openAlerts: number };
};

type Template = { id: string; key: string; name: string; description: string | null; kind: string; active: boolean; milestones: { id: string; title: string; phase: string; daysFromStart: number; priority: string }[] };
type Plan = { company: Account; plan: { id: string; lifecycleStage: string; summary: string | null; nextReviewAt: string | null; healthScore: number; healthBand: string; healthFactors: { key: string; label: string; points: number; detail: string }[] } | null; milestones: any[]; risks: any[]; alerts: any[]; activities: any[] };

const apiError = async (response: Response, fallback: string) => {
  const body = await response.json().catch(() => null);
  return Array.isArray(body?.message) ? body.message.join(', ') : body?.message || fallback;
};

export default function CustomerPlanning({ apiBase }: { apiBase: string }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [detail, setDetail] = useState<Plan | null>(null);
  const [templateKey, setTemplateKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const [accountsResponse, templatesResponse] = await Promise.all([
        fetch(`${apiBase}/customer-planning/accounts`, { credentials: 'same-origin', cache: 'no-store' }),
        fetch(`${apiBase}/customer-planning/templates`, { credentials: 'same-origin', cache: 'no-store' }),
      ]);
      if (!accountsResponse.ok) throw new Error(await apiError(accountsResponse, 'Customer planning is unavailable'));
      if (!templatesResponse.ok) throw new Error(await apiError(templatesResponse, 'Plan templates are unavailable'));
      const nextAccounts = await accountsResponse.json();
      setAccounts(Array.isArray(nextAccounts) ? nextAccounts : []);
      setTemplates((await templatesResponse.json()) || []);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Customer planning is unavailable');
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (companyId: string) => {
    setSelectedId(companyId);
    if (!companyId) { setDetail(null); return; }
    try {
      const response = await fetch(`${apiBase}/customer-planning/accounts/${encodeURIComponent(companyId)}/plan`, { credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) throw new Error(await apiError(response, 'Customer plan is unavailable'));
      setDetail(await response.json());
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Customer plan is unavailable');
    }
  };

  useEffect(() => { void loadAccounts(); }, [apiBase]);

  const selected = useMemo(() => accounts.find(account => account.id === selectedId), [accounts, selectedId]);

  const createPlan = async () => {
    if (!selected || !templateKey || busy) return;
    setBusy(true);
    try {
      const response = await fetch(`${apiBase}/customer-planning/accounts/${selected.id}/plan/from-template`, {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateKey }),
      });
      if (!response.ok) throw new Error(await apiError(response, 'Plan creation failed'));
      setMessage('Customer plan created from template.');
      setTemplateKey('');
      await loadAccounts();
      await loadDetail(selected.id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Plan creation failed');
    } finally {
      setBusy(false);
    }
  };

  const refreshPlan = async () => {
    if (!selected || busy) return;
    setBusy(true);
    try {
      const response = await fetch(`${apiBase}/customer-planning/accounts/${selected.id}/plan/refresh`, { method: 'POST', credentials: 'same-origin' });
      if (!response.ok) throw new Error(await apiError(response, 'Health refresh failed'));
      setMessage('Health signals refreshed.');
      await loadAccounts();
      await loadDetail(selected.id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Health refresh failed');
    } finally {
      setBusy(false);
    }
  };

  return <section className="customer-planning-workspace">
    <div className="page-toolbar">
      <div><p className="workspace-eyebrow">CUSTOMER SUCCESS CONTROL PLANE</p><h1 className="page-title">Customer planning</h1><p className="workspace-subtitle">Lifecycle, health, risks, milestones, and next actions for every managed customer.</p></div>
      <button className="btn-table-action" onClick={() => void loadAccounts()} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh portfolio'}</button>
    </div>
    {error && <p className="workspace-error" role="alert">{error}</p>}
    {message && <p className="workspace-success" role="status">{message}</p>}
    <div className="form-grid-2col" style={{ alignItems: 'start' }}>
      <div className="glass-panel" style={{ padding: 20 }}>
        <h2>Customer portfolio</h2>
        <p className="workspace-subtitle">{accounts.length} managed customer{accounts.length === 1 ? '' : 's'}</p>
        {accounts.length === 0 && !loading && <p className="empty-state">No customers are registered yet.</p>}
        <div style={{ display: 'grid', gap: 10 }}>
          {accounts.map(account => <button key={account.id} className="glass-panel" style={{ textAlign: 'left', padding: 16, color: 'inherit', cursor: 'pointer', borderColor: account.id === selectedId ? 'var(--adm-emerald)' : undefined }} onClick={() => void loadDetail(account.id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><strong>{account.name}</strong><span className="plan-badge-tag">{account.plan?.healthBand || 'NO PLAN'}</span></div>
            <p style={{ margin: '8px 0 0', color: 'var(--adm-muted)' }}>{account.plan?.lifecycleStage || 'Plan not started'} · {account.plan ? `${account.plan.healthScore}/100` : 'Needs planning'}</p>
            <small>{account.counts.openAlerts} alerts · {account.counts.openRisks} risks · {account.counts.openMilestones} open milestones</small>
          </button>)}
        </div>
      </div>
      <div className="glass-panel" style={{ padding: 20 }}>
        {!selected && <><h2>Select a customer</h2><p className="workspace-subtitle">Choose a customer to inspect its lifecycle plan and next actions.</p></>}
        {selected && !detail?.plan && <>
          <h2>{selected.name}</h2><p className="workspace-subtitle">No lifecycle plan has been created.</p>
          <label>Start from template<select className="form-select-box" value={templateKey} onChange={event => setTemplateKey(event.target.value)}><option value="">Choose a template</option>{templates.filter(template => template.active).map(template => <option key={template.key} value={template.key}>{template.name}</option>)}</select></label>
          <button className="btn-provision-trigger" style={{ marginTop: 14 }} disabled={!templateKey || busy} onClick={() => void createPlan()}>{busy ? 'Creating…' : 'Create customer plan'}</button>
        </>}
        {selected && detail?.plan && <>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start' }}><div><h2>{selected.name}</h2><p className="workspace-subtitle">{detail.plan.lifecycleStage} · next review {detail.plan.nextReviewAt ? new Date(detail.plan.nextReviewAt).toLocaleDateString() : 'not scheduled'}</p></div><button className="btn-table-action primary" onClick={() => void refreshPlan()} disabled={busy}>{busy ? 'Refreshing…' : 'Refresh health'}</button></div>
          <div className="database-health-grid" style={{ margin: '18px 0' }}><div className="database-health-card"><span>Health</span><strong>{detail.plan.healthScore}/100</strong></div><div className="database-health-card"><span>Milestones</span><strong>{detail.milestones.filter(item => item.status !== 'DONE').length} open</strong></div><div className="database-health-card"><span>Risks</span><strong>{detail.risks.filter(item => !['RESOLVED', 'MITIGATED'].includes(item.status)).length} open</strong></div><div className="database-health-card"><span>Alerts</span><strong>{detail.alerts.filter(item => ['OPEN', 'ACKNOWLEDGED'].includes(item.status)).length} open</strong></div></div>
          <h3>Health factors</h3><div style={{ display: 'grid', gap: 8 }}>{detail.plan.healthFactors.map(factor => <div key={factor.key} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span>{factor.label}<small style={{ display: 'block', color: 'var(--adm-muted)' }}>{factor.detail}</small></span><strong>{factor.points > 0 ? '+' : ''}{factor.points}</strong></div>)}</div>
          <h3>Next actions</h3><div style={{ display: 'grid', gap: 8 }}>{detail.alerts.filter(item => ['OPEN', 'ACKNOWLEDGED'].includes(item.status)).slice(0, 5).map(item => <div key={item.id} className="workspace-error"><strong>{item.title}</strong><small style={{ display: 'block' }}>{item.details}</small></div>)}{detail.milestones.filter(item => item.status !== 'DONE').slice(0, 5).map(item => <div key={item.id} className="glass-panel" style={{ padding: 10 }}><strong>{item.title}</strong><small style={{ display: 'block', color: 'var(--adm-muted)' }}>{item.phase} · {item.dueAt ? new Date(item.dueAt).toLocaleDateString() : 'no due date'}</small></div>)}{detail.alerts.length === 0 && detail.milestones.length === 0 && <p className="empty-state">No next actions yet.</p>}</div>
        </>}
      </div>
    </div>
  </section>;
}
