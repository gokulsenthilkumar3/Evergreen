import { useEffect, useState } from 'react';

type Update = {
  companyId: string;
  companyName: string;
  installedVersion: string | null;
  latestVersion: string;
  status: string;
  reason: string | null;
  cloudProvider?: string;
  lastSyncAt?: string | null;
  release?: { name: string; changelog: string; createdAt: string };
  diff?: { available: boolean; reason?: string; aheadBy?: number; commits?: { sha: string; url: string; message: string; author: string | null }[]; files?: { filename: string; status: string; additions: number; deletions: number }[] };
};

type UpdateResponse = { available: boolean; reason?: string; latestVersion: string | null; latestRelease?: { name: string; changelog: string; createdAt: string }; updates: Update[] };

const readError = async (response: Response) => {
  const body = await response.json().catch(() => null);
  return Array.isArray(body?.message) ? body.message.join(', ') : body?.message || `Update feed failed (HTTP ${response.status})`;
};

export default function ReleaseUpdates({ apiBase }: { apiBase: string }) {
  const [data, setData] = useState<UpdateResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/cicd/updates`, { credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) throw new Error(await readError(response));
      setData(await response.json());
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Release updates are unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [apiBase]);

  return <section>
    <div className="page-toolbar">
      <div><p className="workspace-eyebrow">INCREMENTAL RELEASE CONTROL</p><h1 className="page-title">Release updates</h1><p className="workspace-subtitle">Technical tag differences plus approved owner notes, mapped to customer installations.</p></div>
      <button className="btn-table-action primary" disabled={loading} onClick={() => void load()}>{loading ? 'Refreshing…' : 'Refresh updates'}</button>
    </div>
    {error && <p className="workspace-error" role="alert">{error}</p>}
    {!error && data && !data.available && <div className="glass-panel" style={{ padding: 20 }}><h2>Release provider unavailable</h2><p>{data.reason}</p><p className="workspace-subtitle">The portal will not claim that customers are updated until the release provider is available.</p></div>}
    {!error && data?.available && <>
      <div className="database-health-grid" style={{ marginBottom: 18 }}><div className="database-health-card"><span>Latest stable</span><strong>{data.latestVersion || 'Not reported'}</strong></div><div className="database-health-card"><span>Updates needed</span><strong>{data.updates.filter(item => item.status === 'UPDATE_AVAILABLE').length}</strong></div><div className="database-health-card"><span>Blocked</span><strong>{data.updates.filter(item => item.status === 'BLOCKED').length}</strong></div><div className="database-health-card"><span>Unknown versions</span><strong>{data.updates.filter(item => item.status === 'UNKNOWN').length}</strong></div></div>
      {data.latestRelease && <div className="glass-panel" style={{ padding: 20, marginBottom: 18 }}><h2>{data.latestRelease.name} · {data.latestVersion}</h2><p style={{ whiteSpace: 'pre-wrap', color: 'var(--adm-muted)' }}>{data.latestRelease.changelog || 'No owner release notes were published.'}</p></div>}
      <div className="record-card-grid">
        {data.updates.map(update => <article key={update.companyId} className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><div><p className="workspace-eyebrow">{update.cloudProvider || 'CUSTOMER'}</p><h2>{update.companyName}</h2></div><span className="plan-badge-tag">{update.status}</span></div>
          <p>{update.installedVersion || 'Version not reported'} → <strong>{update.latestVersion}</strong></p>
          {update.reason && <p className="workspace-error">{update.reason}</p>}
          {update.diff?.available ? <><p className="workspace-subtitle">{update.diff.aheadBy || 0} commits · {update.diff.files?.length || 0} changed files</p><button className="btn-table-action" onClick={() => setExpanded(expanded === update.companyId ? null : update.companyId)}>{expanded === update.companyId ? 'Hide technical diff' : 'Show technical diff'}</button>{expanded === update.companyId && <div style={{ marginTop: 12 }}><h3>Commits</h3><ul>{(update.diff.commits || []).slice(0, 8).map(commit => <li key={commit.sha}><a href={commit.url} target="_blank" rel="noreferrer">{commit.sha.slice(0, 7)}</a> {commit.message}</li>)}</ul><h3>Changed files</h3><ul>{(update.diff.files || []).slice(0, 20).map(file => <li key={file.filename}><code>{file.filename}</code> · +{file.additions} / -{file.deletions}</li>)}</ul></div>}</> : <p className="workspace-subtitle">{update.diff?.reason || 'Technical diff not available.'}</p>}
        </article>)}
      </div>
      {data.updates.length === 0 && <p className="empty-state">All reported customers are on the latest stable release.</p>}
    </>}
  </section>;
}
