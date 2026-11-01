import { useEffect, useState } from 'react';

type Entry = { id: string; title: string; updatedAt: string; payload: Record<string, string> };
export default function DatabaseFleet({ apiBase }: { apiBase: string }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const load = async () => {
    const response = await fetch(`${apiBase}/control/records?kind=DATABASE`, { credentials: 'same-origin' });
    if (!response.ok) throw new Error('Could not load the database inventory. Check your provider session.');
    const next = await response.json();
    if (!Array.isArray(next)) throw new Error('Database inventory returned an invalid response.');
    setEntries(next);
  };
  useEffect(() => { void load().catch(e => setError(e.message)); }, [apiBase]);
  return <article className="glass-panel database-owner-tools">
    <div className="page-toolbar"><div><p className="workspace-eyebrow">DATABASE FLEET</p><h2>Local & cloud databases</h2><p>Track database ownership and cloud consoles across AWS, Azure, Google Cloud and private hosts.</p></div><button className="btn-table-action primary" onClick={() => setOpen(!open)}>Register database</button></div>
    {error && <p role="alert" className="workspace-error">{error}</p>}
    {open && <form onSubmit={async event => {
      event.preventDefault(); setBusy(true); setError('');
      const form = event.currentTarget;
      const values: Record<string, string> = {};
      new FormData(form).forEach((value, key) => { values[key] = String(value); });
      const { title, ...payload } = values;
      try {
        const response = await fetch(`${apiBase}/control/records`, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'DATABASE', title, payload, status: 'REQUESTED', requestKey: crypto.randomUUID() }) });
        if (!response.ok) throw new Error('Database registration failed. Use a console URL without credentials.');
        await load(); setOpen(false);
      } catch (e) { setError(e instanceof Error ? e.message : 'Registration failed'); } finally { setBusy(false); }
    }}>
      <div className="database-health-grid">
        <label>Name<input required maxLength={200} name="title" className="form-input-text" /></label>
        <label>Cloud provider<select name="provider" className="form-input-text">{['AWS', 'Azure', 'Google Cloud', 'Local', 'Other'].map(x => <option key={x}>{x}</option>)}</select></label>
        <label>Engine<select name="engine" className="form-input-text">{['PostgreSQL', 'MySQL', 'SQL Server', 'SQLite', 'MongoDB', 'Other'].map(x => <option key={x}>{x}</option>)}</select></label>
        <label>Region<input name="region" maxLength={120} className="form-input-text" /></label>
        <label>Environment<select name="environment" className="form-input-text">{['Development', 'Staging', 'Production'].map(x => <option key={x}>{x}</option>)}</select></label>
        <label>Cloud console URL<input required type="url" name="endpoint" className="form-input-text" placeholder="https://console.cloud.google.com/…" /></label>
      </div><p>Store console links only. Database passwords and connection strings belong in your cloud secret manager.</p><button disabled={busy} className="btn-table-action primary">{busy ? 'Saving…' : 'Save database'}</button>
    </form>}
    <label>Find databases<input className="form-input-text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, provider, region or engine" /></label>
    <div className="database-table-scroll"><table className="tenants-data-table"><thead><tr>{['Database', 'Provider / region', 'Engine', 'Environment', 'Monitoring', 'Console'].map(x => <th key={x}>{x}</th>)}</tr></thead><tbody>
      {entries.filter(x => JSON.stringify([x.title, x.payload]).toLowerCase().includes(query.toLowerCase())).map(x => <tr key={x.id}><td>{x.title}</td><td>{x.payload.provider || 'Unspecified'} / {x.payload.region || '—'}</td><td>{x.payload.engine || 'Unknown'}</td><td>{x.payload.environment || 'Unspecified'}</td><td>Not connected</td><td>{/^https?:\/\//.test(x.payload.endpoint || '') && <a href={x.payload.endpoint} target="_blank" rel="noopener noreferrer">Open console ↗</a>}</td></tr>)}
    </tbody></table></div>
    {!entries.length && <p>No databases registered. Add your cloud databases to start tracking the fleet.</p>}
    <p className="workspace-subtitle">Cloud monitoring requires a connector for each host. Inventory entries show registration only; live provider health and schema appear below.</p>
  </article>;
}
