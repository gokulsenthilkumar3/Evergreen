import { useEffect, useState } from "react";
type Job = {
  id: string;
  kind: string;
  entityId: string;
  state: string;
  at: string;
};
export default function OperationTools({
  apiBase,
  kind,
  entityId = "provider",
}: {
  apiBase: string;
  kind: "backup" | "provision" | "webhook" | "rollback";
  entityId?: string;
}) {
  const [jobs, setJobs] = useState<Job[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [step, setStep] = useState("region"),
    [note, setNote] = useState("");
  const load = async () => {
    const r = await fetch(apiBase + "/control/requests", {
      credentials: "same-origin",
      signal: AbortSignal.timeout(5000),
    });
    if (r.ok) {
      const d = await r.json();
      if (Array.isArray(d)) setJobs(d);
    }
  };
  useEffect(() => {
    void load().catch(() => {});
  }, [apiBase]);
  const request = async (drill = false) => {
    setBusy(true);
    setError("");
    try {
      const path =
        kind === "backup"
          ? drill
            ? "/backups/provider/drill"
            : "/backups/trigger"
          : kind === "provision"
            ? "/provision/" + step
            : kind === "webhook"
              ? "/webhooks/" + encodeURIComponent(entityId) + "/replay"
              : "/deployments/" + encodeURIComponent(entityId) + "/rollback";
      const response = await fetch(apiBase + path, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestKey: crypto.randomUUID(), note }),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw Error("Request could not be recorded");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  };
  const relevant = jobs.filter((j) =>
    kind === "backup"
      ? ["BACKUP", "RESTORE_DRILL"].includes(j.kind)
      : kind === "provision"
        ? j.kind.startsWith("PROVISION_")
        : j.entityId === entityId,
  );
  return (
    <article className="glass-panel ops-chart">
      <p className="workspace-eyebrow">PERSISTENT OPERATION REQUEST</p>
      <h2>
        {kind === "backup"
          ? "Backup & recovery requests"
          : kind === "provision"
            ? "Provisioning workflow"
            : kind === "webhook"
              ? "Delivery replay"
              : "Rollback request"}
      </h2>
      {kind === "provision" && (
        <>
          <ol className="operation-steps">
            {["region", "engine", "secrets", "dns", "smoke", "attest"].map(
              (s) => (
                <li key={s} data-active={step === s}>
                  {s}
                </li>
              ),
            )}
          </ol>
          <label>
            Step
            <select
              className="form-select-box"
              value={step}
              onChange={(e) => setStep(e.target.value)}
            >
              {["region", "engine", "secrets", "dns", "smoke", "attest"].map(
                (s) => (
                  <option key={s}>{s}</option>
                ),
              )}
            </select>
          </label>
        </>
      )}
      <label>
        Plan / evidence reference
        <textarea
          className="form-input-text"
          value={note}
          maxLength={1000}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Describe the intended step. Use secret references, never secret values."
        />
      </label>
      <div className="page-toolbar">
        <button
          className="btn-table-action primary"
          disabled={busy}
          onClick={() => void request()}
        >
          {busy
            ? "Recording…"
            : kind === "backup"
              ? "Request backup"
              : kind === "provision"
                ? "Record step request"
                : "Record execution request"}
        </button>
        {kind === "backup" && (
          <button
            className="btn-table-action"
            disabled={busy}
            onClick={() => void request(true)}
          >
            Schedule restore drill
          </button>
        )}
      </div>
      {error && <p role="alert">{error}</p>}
      <p className="workspace-subtitle">
        Requests are saved and hash-chained. Without an executor acknowledgement
        they remain queued; no cloud or data operation is assumed. Attestation
        requests do not constitute a signature.
      </p>
      <ul>
        {relevant.slice(0, 8).map((j) => (
          <li key={j.id}>
            {j.kind} · {j.state} · {new Date(j.at).toLocaleString()}
          </li>
        ))}
      </ul>
    </article>
  );
}
