import { useEffect, useState } from 'react';
type Customer = { id: string; name: string; cloudProvider: string; deploymentUrl?: string; lastSyncAt?: string };
type Action = { method: string; path: string; group: string; summary: string; requests: number; errors: number; averageMs: number | null; lastSeen: string | null; lastStatus: number | null };
type Monitor = { connected: boolean; reason?: string; startedAt?: string; checkedAt?: string; actions: Action[] };
export default function CustomerApiConsole({ apiBase }: { apiBase: string }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [group, setGroup] = useState('');
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${apiBase}/companies`, { credentials: 'same-origin', signal: controller.signal }).then(async r => { if (!r.ok) throw new Error('Unable to load customers'); setCustomers(await r.json()); }).catch(e => { if (!controller.signal.aborted) setError(e.message); });
    return () => controller.abort();
  }, [apiBase, refresh]);
  useEffect(() => {
    if (!selected) return;
    const controller = new AbortController();
    let pending = false;
    const load = async () => {
      if (pending) return; pending = true; setLoading(true);
      try {
        const r = await fetch(`${apiBase}/control/customer-apis/${encodeURIComponent(selected.id)}`, { credentials: 'same-origin', signal: controller.signal, cache: 'no-store' });
        if (!r.ok) throw new Error('Unable to load customer API monitoring');
        const data = await r.json(); if (!controller.signal.aborted) { setMonitor(data); setError(''); }
      } catch(e) { if (!controller.signal.aborted) { setMonitor(null); setError(e instanceof Error ? e.message : 'Monitoring failed'); } }
      finally { pending = false; if (!controller.signal.aborted) setLoading(false); }
    };
    void load(); const timer = setInterval(() => { if (!document.hidden) void load(); }, 15000);
    return () => { controller.abort(); clearInterval(timer); };
  }, [apiBase, selected, refresh]);
  const actions = monitor?.actions || [];
  const groups = [...new Set(actions.map(x => x.group))].sort();
  const rows = actions.filter(x => (!group || x.group === group) && (!active || x.requests > 0) && `${x.method} ${x.path} ${x.summary}`.toLowerCase().includes(query.toLowerCase()));
  return <section>
    <div className="page-toolbar"><div><p className="workspace-eyebrow">CUSTOMER OBSERVABILITY</p><h1 className="page-title">Customer API console</h1><p className="workspace-subtitle">Customers → API groups → endpoint activity</p></div><button className="btn-table-action primary" disabled={loading} onClick={() => setRefresh(x => x + 1)}>{loading ? 'Refreshing…' : 'Refresh'}</button></div>
    {error && <p role="alert" className="workspace-error">{error}</p>}
    <nav aria-label="API console navigation"><button className="btn-table-action" onClick={() => { setSelected(null); setMonitor(null); setGroup(''); setQuery(''); }}>All customers</button>{selected && <> / <button className="btn-table-action" onClick={() => setGroup('')}>{selected.name}</button>{group && <> / {group}</>}</>}</nav>
    {!selected ? <><p>{customers.length} registered customers. Select a customer to inspect its API groups and observed activity.</p><div className="record-card-grid">{customers.map(customer => <button className="glass-panel" key={customer.id} onClick={() => { setSelected(customer); setMonitor(null); setGroup(''); setQuery(''); }} style={{ textAlign: 'left', padding: 24, color: 'inherit', cursor: 'pointer' }}><p className="workspace-eyebrow">{customer.cloudProvider}</p><h2>{customer.name}</h2><p>{customer.deploymentUrl || 'Deployment URL not recorded'}</p><p>Last customer sync: {customer.lastSyncAt ? new Date(customer.lastSyncAt).toLocaleString() : 'Never received'}</p><strong>View API groups →</strong></button>)}</div>{!customers.length && <p>No customers registered.</p>}</> : <>
      <h2>{selected.name}</h2>
      {monitor && !monitor.connected && <article className="glass-panel database-owner-tools"><h3>Monitoring not connected</h3><p>{monitor.reason}</p><p>Configure this customer's monitoring host and a dedicated monitoring credential on the provider server. Activity will appear after connection.</p></article>}
      {monitor?.connected && <>
        <div className="database-health-grid">{[['API groups', groups.length], ['Endpoints', actions.length], ['Observed active endpoints', actions.filter(x => x.requests > 0).length], ['Requests', actions.reduce((n,x) => n+x.requests,0)], ['Errors (4xx / 5xx)', actions.reduce((n,x) => n+x.errors,0)]].map(([label,value]) => <article className="glass-panel database-health-card" key={label}><span>{label}</span><strong>{value}</strong></article>)}</div>
        <p className="workspace-subtitle">Counters since API start: {monitor.startedAt && new Date(monitor.startedAt).toLocaleString()}. Last checked: {monitor.checkedAt && new Date(monitor.checkedAt).toLocaleTimeString()}. Refreshes every 15 seconds. Active means at least one observed request during this period.</p>
        {!group && <div className="record-card-grid">{groups.map(name => <button className="glass-panel" style={{ padding: 24, color: 'inherit', textAlign: 'left', cursor: 'pointer' }} key={name} onClick={() => setGroup(name)}><h3>{name}</h3><p>{actions.filter(x => x.group === name).length} endpoints · {actions.filter(x => x.group === name && x.requests > 0).length} active</p><strong>Inspect actions →</strong></button>)}</div>}
        <div className="page-toolbar"><label>Search actions<input className="form-input-text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Method, route or action" /></label><label><input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} /> Active endpoints only</label></div>
        <div className="database-table-scroll"><table className="tenants-data-table"><thead><tr>{['Method','Endpoint / action','Group','Activity','Requests','Errors','Avg latency','Last status','Last request'].map(x => <th key={x}>{x}</th>)}</tr></thead><tbody>{rows.map(x => <tr key={`${x.method} ${x.path}`}><td className="font-mono">{x.method}</td><td><code>{x.path}</code><p>{x.summary}</p></td><td>{x.group}</td><td>{x.requests ? 'Observed active' : 'No observed requests'}</td><td>{x.requests}</td><td>{x.errors}</td><td>{x.averageMs === null ? '—' : `${x.averageMs} ms`}</td><td>{x.lastStatus || '—'}</td><td>{x.lastSeen ? new Date(x.lastSeen).toLocaleString() : '—'}</td></tr>)}</tbody></table>{!rows.length && <p>No actions match these filters.</p>}</div>
      </>}
    </>}
  </section>;
}
