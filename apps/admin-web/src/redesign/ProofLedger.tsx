import { useEffect, useState } from "react";
import ProofBadge from "./ProofBadge";
import type { Proof } from "./ProofBadge";
import EmptyScene from "./EmptyScene";
export type ProofEvent = {
  id: string;
  seq?: number;
  entityId: string;
  entityType: string;
  title: string;
  actor: string;
  action: string;
  proof: Proof;
  at: string;
  hash?: string;
};
export default function ProofLedger({
  apiBase,
  onInspect,
  jobsOnly = false,
}: {
  apiBase: string;
  onInspect: (item: ProofEvent) => void;
  jobsOnly?: boolean;
}) {
  const [events, setEvents] = useState<ProofEvent[]>([]),
    [nextCursor, setNextCursor] = useState<string | null>(null),
    [error, setError] = useState(""),
    [filter, setFilter] = useState("all"),
    [search, setSearch] = useState(""),
    [entity, setEntity] = useState(""),
    [refresh, setRefresh] = useState(0),
    [busy, setBusy] = useState(false),
    [chain, setChain] = useState<{
      ok: boolean;
      checked: number;
      brokenAt?: number;
      anchor?: string;
    } | null>(null);
  const load = async (cursor?: string, signal?: AbortSignal) => {
    setBusy(true);
    try {
      const q = new URLSearchParams({
        limit: "50",
        ...(cursor ? { cursor } : {}),
        ...(entity ? { entity } : {}),
        ...(jobsOnly ? { entity: "RELEASE_JOB" } : {}),
      });
      const r = await fetch(apiBase + "/control/proof?" + q, {
        credentials: "same-origin",
        signal,
        cache: "no-store",
      });
      if (!r.ok) throw Error("Proof ledger unavailable");
      const d = await r.json();
      if (!Array.isArray(d.events)) throw Error("Invalid proof response");
      if (!signal?.aborted) {
        setEvents((old) =>
          cursor
            ? [
                ...old,
                ...d.events.filter(
                  (e: ProofEvent) => !old.some((x) => x.id === e.id),
                ),
              ]
            : d.events,
        );
        setNextCursor(d.nextCursor || null);
        setError("");
      }
    } catch (e) {
      if (!signal?.aborted)
        setError(e instanceof Error ? e.message : "Ledger unavailable");
    } finally {
      if (!signal?.aborted) setBusy(false);
    }
  };
  useEffect(() => {
    const c = new AbortController();
    void load(undefined, c.signal);
    return () => c.abort();
  }, [apiBase, refresh, entity, jobsOnly]);
  const verify = async () => {
    setBusy(true);
    try {
      const r = await fetch(apiBase + "/control/proof/verify", {
        method: "POST",
        credentials: "same-origin",
        signal: AbortSignal.timeout(15000),
      });
      if (!r.ok) throw Error("Chain verification unavailable");
      setChain(await r.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  };
  const rows = events.filter(
    (e) =>
      (filter === "all" || e.proof.state === filter) &&
      [e.title, e.actor, e.entityType, e.entityId]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <section className="proof-ledger proof-stage">
      <div className="page-toolbar">
        <div>
          <p className="workspace-eyebrow">VERIFY / APPEND-ONLY EVIDENCE</p>
          <h1 className="page-title">
            {jobsOnly ? "Job queue" : "Proof & audit"}
          </h1>
          <p className="workspace-subtitle">
            Hash-chained events, ordered by ledger sequence. Older records
            remain accessible.
          </p>
        </div>
        <div>
          <button
            className="btn-table-action"
            disabled={busy}
            onClick={() => void verify()}
          >
            Verify chain
          </button>
          <button
            className="btn-table-action"
            disabled={busy}
            onClick={() => setRefresh((x) => x + 1)}
          >
            Refresh ledger
          </button>
        </div>
      </div>
      {error && <p role="alert">{error}</p>}
      {chain && (
        <p role="status" className={chain.ok ? "chain-ok" : "chain-broken"}>
          {chain.ok ? "Chain intact" : "Broken chain at " + chain.brokenAt} ·{" "}
          {chain.checked} entries checked. {chain.anchor}
        </p>
      )}
      <div className="proof-funnel">
        {(["recorded", "requested", "executed", "verified"] as const).map(
          (state) => (
            <button
              key={state}
              data-proof={state}
              aria-pressed={filter === state}
              onClick={() => setFilter(filter === state ? "all" : state)}
            >
              <strong>
                {events.filter((e) => e.proof.state === state).length}
              </strong>
              <span>{state} · loaded</span>
            </button>
          ),
        )}
      </div>
      <div className="page-toolbar">
        <input
          className="form-input-text"
          aria-label="Search proof events"
          placeholder="Search loaded events…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          className="form-input-text"
          aria-label="Ledger entity"
          placeholder="Filter all history by exact entity ID or type"
          value={entity}
          onChange={(e) => setEntity(e.target.value)}
        />
        <select
          aria-label="Proof state"
          className="form-select-box"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {[
            "all",
            "recorded",
            "requested",
            "executed",
            "verified",
            "failed",
            "stale",
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <p className="workspace-subtitle">
        Showing {events.length} loaded entries. Historic events retain their
        original scope; a reachability probe never attests a business operation.
      </p>
      <ol className="proof-timeline stagger">
        {rows.map((e) => (
          <li key={e.id} data-proof={e.proof.state}>
            <button onClick={() => onInspect(e)}>
              <div>
                <span className="workspace-eyebrow">
                  #{e.seq || "—"} · {e.entityType} · {e.action}
                </span>
                <h3>{e.title}</h3>
                <small>
                  {e.actor} · {new Date(e.at).toLocaleString()}
                </small>
              </div>
              <ProofBadge proof={e.proof} />
            </button>
          </li>
        ))}
      </ol>
      {!rows.length && !busy && (
        <EmptyScene
          scene="proof"
          title="No evidence matches this view"
          body="Choose another filter or load older ledger entries."
          hint="No external execution is inferred from a saved claim."
        />
      )}
      {nextCursor && (
        <button
          className="btn-table-action primary"
          disabled={busy}
          onClick={() => void load(nextCursor)}
        >
          {busy ? "Loading…" : "Load older entries"}
        </button>
      )}
    </section>
  );
}
