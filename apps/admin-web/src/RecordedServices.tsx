import { useState } from "react";
import type { RecordItem } from "./control-data";
import ProofBadge from "./redesign/ProofBadge";
import EmptyScene from "./redesign/EmptyScene";
import OperationTools from "./redesign/OperationTools";
export default function RecordedServices({
  title,
  kind,
  records,
  onCreate,
  onInspect,
  apiBase,
}: {
  title: string;
  kind: string;
  records: RecordItem[];
  onCreate: () => void;
  onInspect?: (r: RecordItem) => void;
  apiBase: string;
}) {
  const [observed, setObserved] = useState<Record<string, RecordItem["proof"]>>(
      {},
    ),
    [selected, setSelected] = useState(""),
    [busy, setBusy] = useState(""),
    [error, setError] = useState("");
  const test = async (id: string) => {
    setBusy(id);
    setError("");
    try {
      const r = await fetch(
        apiBase + "/connectors/" + encodeURIComponent(id) + "/test",
        {
          method: "POST",
          credentials: "same-origin",
          signal: AbortSignal.timeout(5000),
        },
      );
      if (!r.ok)
        throw Error(
          r.status === 404 ? "Test endpoint absent" : "Probe unavailable",
        );
      const d = await r.json();
      setObserved((old) => ({ ...old, [id]: d.proof }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Probe failed");
    } finally {
      setBusy("");
    }
  };
  const items = records.filter((r) => r.kind === kind);
  return (
    <section>
      <div className="page-toolbar">
        <div>
          <p className="workspace-eyebrow">
            CONNECTIVITY / CONFIGURATION & OBSERVATIONS
          </p>
          <h1 className="page-title">{title}</h1>
          <p className="workspace-subtitle">
            Saved configuration is separate from endpoint reachability and
            delivery execution.
          </p>
        </div>
        <button className="btn-table-action primary" onClick={onCreate}>
          Add record
        </button>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="record-card-grid">
        {items.map((r) => (
          <article className="glass-panel ops-chart" key={r.id}>
            <span className="workspace-eyebrow">{r.status}</span>
            <h2>
              <button className="row-inspect" onClick={() => onInspect?.(r)}>
                {r.title}
              </button>
            </h2>
            <ProofBadge proof={observed[r.id] || r.proof} />
            <p>Owner: {r.owner}</p>
            <p>Updated {new Date(r.updatedAt).toLocaleString()}</p>
            <p className="workspace-subtitle">
              {observed[r.id]?.reason || "No independent observation yet."}
            </p>
            <button
              className="btn-table-action"
              disabled={!!busy}
              onClick={() => void test(r.id)}
            >
              {busy === r.id ? "Probing…" : "Test connection"}
            </button>
            {kind === "WEBHOOK" && (
              <button
                className="btn-table-action"
                onClick={() => setSelected(r.id)}
              >
                Request replay
              </button>
            )}
          </article>
        ))}
      </div>
      {selected && (
        <OperationTools apiBase={apiBase} kind="webhook" entityId={selected} />
      )}{" "}
      {!items.length && (
        <EmptyScene
          scene="events"
          title={"No " + title.toLowerCase() + " recorded"}
          body="Add a configuration record to start tracking this service."
          hint="Saving a configuration does not execute the external service."
        >
          <button className="btn-table-action primary" onClick={onCreate}>
            Add record
          </button>
        </EmptyScene>
      )}
    </section>
  );
}
