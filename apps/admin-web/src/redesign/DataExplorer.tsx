import { useEffect, useState } from "react";
type Result = {
  rows: Record<string, unknown>[];
  total: number;
  scope: string;
  fields?: string[];
  redactions?: { field: string; reason: string }[];
};
export default function DataExplorer({ apiBase }: { apiBase: string }) {
  const [table, setTable] = useState("Company"),
    [tier, setTier] = useState("safe"),
    [page, setPage] = useState(0),
    [granted, setGranted] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [data, setData] = useState<Result | null>(null);
  useEffect(() => {
    setData(null);
    setPage(0);
  }, [table]);
  const load = async (preview = false) => {
    setBusy(true);
    setError("");
    try {
      const r = await fetch(apiBase + "/control/explorer", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table,
          page,
          ...(tier === "payload" ? { tier } : {}),
          ...(preview ? { preview: true } : {}),
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (!r.ok)
        throw Error(
          r.status === 429
            ? "Rate limit reached; retry in one minute."
            : "Read denied or unavailable. Payload access requires owner policy.",
        );
      setData(await r.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Read failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section>
      <div className="page-toolbar">
        <div>
          <p className="workspace-eyebrow">SYSTEM / AUDITED OWNER ACCESS</p>
          <h1 className="page-title">Data explorer</h1>
          <p className="workspace-subtitle">
            Metadata and approved payload fields. Secret fields and arbitrary
            SQL are excluded.
          </p>
        </div>
      </div>
      <article className="glass-panel ops-chart">
        <label>
          <input
            type="checkbox"
            disabled={busy}
            checked={granted}
            onChange={(e) => {
              setGranted(e.target.checked);
              setData(null);
            }}
          />{" "}
          I understand these owner-authorized reads are recorded in the audit
          log.
        </label>
        <div className="page-toolbar">
          <select
            aria-label="Provider table"
            className="form-select-box"
            disabled={busy}
            value={table}
            onChange={(e) => setTable(e.target.value)}
          >
            {["Company", "ControlRecord", "ReleaseJob", "ControlAudit"].map(
              (t) => (
                <option key={t}>{t}</option>
              ),
            )}
          </select>
          <label>
            Projection
            <select
              className="form-select-box"
              value={tier}
              disabled={busy}
              onChange={(e) => {
                setTier(e.target.value);
                setData(null);
              }}
            >
              <option value="safe">Metadata</option>
              <option value="payload">Redacted payload</option>
            </select>
          </label>
          <label>
            Page (50 rows)
            <input
              className="form-input-text"
              type="number"
              min={1}
              max={10001}
              disabled={busy}
              value={page + 1}
              onChange={(e) => {
                setPage(Math.max(0, Number(e.target.value) - 1));
                setData(null);
              }}
            />
          </label>
          <button
            className="btn-table-action"
            disabled={!granted || busy}
            onClick={() => void load(true)}
          >
            Preview redactions
          </button>
          <button
            className="btn-table-action primary"
            disabled={!granted || busy}
            onClick={() => void load()}
          >
            {busy ? "Reading…" : "Read table"}
          </button>
        </div>
        {error && <p role="alert">{error}</p>}
        {data && (
          <>
            <p>
              {data.total} total rows · {data.scope}
            </p>
            {data.fields && (
              <p>
                Available field names:{" "}
                {data.fields.join(", ") || "No payload fields for this table"}
              </p>
            )}
            {!!data.redactions?.length && (
              <details>
                <summary>Projection / redaction policy</summary>
                <ul>
                  {data.redactions.map((r) => (
                    <li key={r.field}>
                      {r.field}: {r.reason}
                    </li>
                  ))}
                </ul>
              </details>
            )}
            <div className="database-table-scroll">
              <table className="tenants-data-table">
                <thead>
                  <tr>
                    {Object.keys(data.rows[0] || {}).map((k) => (
                      <th key={k}>{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row, i) => (
                    <tr key={i}>
                      {Object.entries(row).map(([k, v]) => (
                        <td key={k}>
                          {v === null
                            ? "—"
                            : typeof v === "object"
                              ? JSON.stringify(v)
                              : String(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data.rows.length && <p>No row values returned.</p>}
            </div>
          </>
        )}
      </article>
    </section>
  );
}
