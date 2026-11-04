import { useEffect, useState } from "react";
import ProofBadge from "./ProofBadge";
import type { Proof } from "./ProofBadge";
import type { Inspection } from "./Inspector";
type Company = {
  id: string;
  name: string;
  cloudProvider: string;
  status: string;
  lastSyncAt: string | null;
  proof?: Proof;
};
export default function Topology({
  companies,
  onInspect,
  apiBase,
}: {
  companies: Company[];
  onInspect: (i: Inspection) => void;
  apiBase: string;
}) {
  const [remote, setRemote] = useState<Company[] | null>(null),
    [busy, setBusy] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    const c = new AbortController();
    fetch(apiBase + "/topology", {
      credentials: "same-origin",
      signal: c.signal,
    })
      .then(async (r) => {
        if (r.ok) {
          const d = await r.json();
          if (Array.isArray(d.companies)) setRemote(d.companies);
        }
      })
      .catch(() => {});
    return () => c.abort();
  }, [apiBase, companies]);
  const probe = async (company: Company) => {
    setBusy(company.id);
    setError("");
    try {
      const r = await fetch(
        apiBase + "/topology/" + encodeURIComponent(company.id) + "/probe",
        {
          method: "POST",
          credentials: "same-origin",
          signal: AbortSignal.timeout(5000),
        },
      );
      if (!r.ok) throw Error("Reachability probe failed");
      const d = await r.json();
      setRemote((old) =>
        (old || companies).map((c) =>
          c.id === company.id ? { ...c, proof: d.proof } : c,
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Probe unavailable");
    } finally {
      setBusy("");
    }
  };
  return (
    <section>
      <div className="page-toolbar">
        <div>
          <p className="workspace-eyebrow">PROVISION / REGISTERED ESTATE</p>
          <h1 className="page-title">Topology</h1>
          <p className="workspace-subtitle">
            Probe results expire after their evidence window. Reachability is
            not business-operation proof.
          </p>
        </div>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="estate-map">
        <article className="glass-panel estate-owner">
          <h2>Owner workstation</h2>
          <p>Signing key custody</p>
        </article>
        <div className="estate-link" />
        <article className="glass-panel estate-provider">
          <h2>Provider workspace</h2>
          <p>Database, requests, evidence</p>
        </article>
        <div className="estate-link" />
        <div className="estate-companies">
          {(remote || companies).map((c) => (
            <article
              className="glass-panel estate-node"
              key={c.id}
              data-proof={c.proof?.state || "recorded"}
            >
              <span className="workspace-eyebrow">{c.cloudProvider}</span>
              <h3>
                <button
                  className="row-inspect"
                  onClick={() =>
                    onInspect({
                      id: c.id,
                      title: c.name,
                      type: "COMPANY",
                      proof: c.proof,
                      data: c,
                    })
                  }
                >
                  {c.name}
                </button>
              </h3>
              <ProofBadge proof={c.proof} />
              <p>
                {c.proof?.at
                  ? "Observed " + new Date(c.proof.at).toLocaleTimeString()
                  : "No reachability observation"}
              </p>
              <button
                className="btn-table-action"
                disabled={!!busy}
                onClick={() => void probe(c)}
              >
                {busy === c.id ? "Probing…" : "Probe reachability"}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
