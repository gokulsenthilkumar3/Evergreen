import { useEffect, useRef, useState } from "react";
type Snapshot = {
  engine: string;
  scope: string;
  companies: number;
  records: number;
  auditEvents: number;
  tenantDatabaseAccess: boolean;
  checkedAt?: string;
  integrity?: string;
  journalMode?: string;
  encryption?: string;
  prismaVersion?: string;
  models?: {
    name: string;
    fields: {
      name: string;
      type: string;
      required: boolean;
      relation: boolean;
    }[];
  }[];
};
export default function DatabaseWorkspace({ apiBase }: { apiBase: string }) {
  const [data, setData] = useState<Snapshot | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [selection, setSelection] = useState("");
  const sequence = useRef(0);
  const load = async (signal?: AbortSignal) => {
    const current = ++sequence.current;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`${apiBase}/control/database`, {
        credentials: "same-origin",
        signal: signal || AbortSignal.timeout(10000),
        cache: "no-store",
      });
      if (!response.ok)
        throw new Error(
          "Database diagnostics could not be loaded. Check your owner session and retry.",
        );
      const next = (await response.json()) as Snapshot;
      if (!next.engine || !Number.isInteger(next.companies))
        throw new Error("Database diagnostics returned an invalid response.");
      if (sequence.current === current) setData(next);
    } catch (failure) {
      if (sequence.current === current)
        setError(
          signal?.aborted
            ? "Database diagnostics timed out. Please retry."
            : failure instanceof Error
              ? failure.message
              : "Could not load database diagnostics.",
        );
    } finally {
      if (sequence.current === current) setBusy(false);
    }
  };
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    void load(controller.signal);
    return () => {
      sequence.current++;
      controller.abort();
      clearTimeout(timer);
    };
  }, [apiBase]);
  const models = (data?.models || []).filter((model) =>
    `${model.name} ${model.fields.map((field) => field.name).join(" ")}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const model = models.find((item) => item.name === selection) || models[0];
  return (
    <section className="database-workspace">
      <div className="page-toolbar">
        <div>
          <p className="workspace-eyebrow">OWNER / DATA</p>
          <h1 className="page-title">Database studio</h1>
          <p className="workspace-subtitle">
            Live provider diagnostics and Prisma schema. Refresh before making
            an operational decision.
          </p>
        </div>
        <button
          type="button"
          className="btn-table-action primary"
          disabled={busy}
          onClick={() => void load()}
        >
          {busy ? "Checking..." : "Refresh diagnostics"}
        </button>
      </div>
      {error && (
        <p role="alert" className="workspace-error">
          {error}
        </p>
      )}
      {data && (
        <>
          <div className="database-health-grid">
            {[
              [
                "Engine",
                `${data.engine} / Prisma ${data.prismaVersion || "unknown"}`,
              ],
              ["Integrity", data.integrity || "Not checked"],
              ["Journal mode", data.journalMode || "Not checked"],
              ["Storage encryption", data.encryption || "Not verified"],
              ["Companies", data.companies],
              ["Control records", data.records],
              ["Audit events", data.auditEvents],
              [
                "Tenant data",
                data.tenantDatabaseAccess
                  ? "Accessible"
                  : "Separate - no access here",
              ],
            ].map(([label, value]) => (
              <article
                className="glass-panel database-health-card"
                key={String(label)}
              >
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </div>
          <p className="workspace-subtitle">
            Last checked:{" "}
            {data.checkedAt
              ? new Date(data.checkedAt).toLocaleString()
              : "Unavailable"}
            . These values come from this provider database.
          </p>
        </>
      )}
      <div className="database-schema-layout">
        <aside className="glass-panel">
          <h2>Schema explorer</h2>
          <label htmlFor="schema-search">Find a model or field</label>
          <input
            id="schema-search"
            className="form-input-text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Company, status, createdAt..."
          />
          <nav aria-label="Database models">
            {models.map((item) => (
              <button
                type="button"
                key={item.name}
                aria-pressed={model?.name === item.name}
                onClick={() => setSelection(item.name)}
              >
                {item.name}
                <span>{item.fields.length} fields</span>
              </button>
            ))}
          </nav>
          {!models.length && <p>No matching schema models.</p>}
        </aside>
        <article className="glass-panel">
          <h2>{model?.name || "Select a model"}</h2>
          <p className="workspace-subtitle">
            Schema metadata only. Credentials and row values are excluded.
          </p>
          <div className="database-table-scroll">
            <table className="tenants-data-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Relation</th>
                </tr>
              </thead>
              <tbody>
                {model?.fields.map((field) => (
                  <tr key={field.name}>
                    <td>{field.name}</td>
                    <td>{field.type}</td>
                    <td>{field.required ? "Yes" : "No"}</td>
                    <td>{field.relation ? "Yes" : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
      <article className="glass-panel database-owner-tools">
        <h2>Open Prisma Studio on your owner host</h2>
        <p>
          Run these commands in your own terminal. Studio binds to loopback,
          requires your protected owner configuration and opens the active
          private database.
        </p>
        <code>npm run db:studio:provider</code>
        <code>npm run db:studio:tenant</code>
        <p>
          Provider: localhost:5556 / Tenant: localhost:5555. Studio can edit
          data directly; take a snapshot before manual changes. Database
          compaction and snapshots are performed using the documented owner
          tools, with actual results shown in the terminal.
        </p>
      </article>
    </section>
  );
}
