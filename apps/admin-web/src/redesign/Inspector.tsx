import { useEffect, useRef, useState } from "react";
import ProofBadge from "./ProofBadge";
import type { Proof } from "./ProofBadge";
export type Inspection = {
  id: string;
  title: string;
  type: string;
  proof?: Proof;
  data: unknown;
  at?: string;
};
export default function Inspector({
  item,
  onClose,
  apiBase,
}: {
  item: Inspection | null;
  apiBase?: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState("detail");
  const [signedToken, setSignedToken] = useState(""),
    [observation, setObservation] = useState<unknown>(null),
    [evidenceError, setEvidenceError] = useState("");
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setTab("detail");
    setObservation(null);
    setSignedToken("");
    setEvidenceError("");
    if (!item) return;
    const previous = document.activeElement as HTMLElement;
    close.current?.focus();
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("keydown", escape);
      previous?.focus();
    };
  }, [item?.id, onClose]);
  return (
    <aside
      className="proof-inspector"
      data-selected={!!item}
      aria-label="Record inspector"
    >
      <header>
        <span className="workspace-eyebrow">
          INSPECTOR / {item?.type || "NOTHING SELECTED"}
        </span>
        {item && (
          <button
            ref={close}
            className="btn-ghost"
            onClick={onClose}
            aria-label="Close inspector"
          >
            ×
          </button>
        )}
      </header>
      {item ? (
        <>
          <h2>{item.title}</h2>
          <ProofBadge proof={item.proof} />
          <div className="inspector-tabs" aria-label="Inspector views">
            {["detail", "proof", "raw"].map((t) => (
              <button
                key={t}
                aria-pressed={tab === t}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          {tab === "detail" && (
            <dl>
              <dt>Entity ID</dt>
              <dd>
                <code>{item.id}</code>
              </dd>
              <dt>Type</dt>
              <dd>{item.type}</dd>
              <dt>Evidence time</dt>
              <dd>
                {item.proof?.at
                  ? new Date(item.proof.at).toLocaleString()
                  : item.at
                    ? new Date(item.at).toLocaleString()
                    : "Not available"}
              </dd>
              <dt>Evidence boundary</dt>
              <dd>
                {item.proof?.reason ||
                  "Provider registration only. No execution or independent verification evidence."}
              </dd>
            </dl>
          )}
          {tab === "proof" && (
            <div className="inspector-proof">
              <ProofBadge proof={item.proof} />
              <p>
                {item.proof?.reason ||
                  "This record is saved in the provider database."}
              </p>
              <small>Source: {item.proof?.source || "provider.database"}</small>
              {item.proof?.evidenceRef && apiBase && (
                <button
                  className="btn-table-action"
                  onClick={async () => {
                    try {
                      const r = await fetch(
                        apiBase +
                          "/control/evidence/" +
                          encodeURIComponent(item.proof!.evidenceRef!),
                        { credentials: "same-origin" },
                      );
                      if (!r.ok) throw Error("Evidence unavailable");
                      setObservation(await r.json());
                    } catch (e) {
                      setEvidenceError(
                        e instanceof Error ? e.message : "Evidence unavailable",
                      );
                    }
                  }}
                >
                  Open evidence {item.proof.evidenceRef.slice(0, 8)}
                </button>
              )}
              {!!item.data &&
                typeof item.data === "object" &&
                "attestationDigest" in item.data &&
                apiBase && (
                  <details>
                    <summary>Signed owner approval</summary>
                    <p>
                      Sign this record digest on your owner laptop. Approval
                      confirms your signature, not external execution.
                    </p>
                    <code>
                      node scripts/security/owner-attest.cjs --id {item.id}{" "}
                      --digest {String(item.data.attestationDigest)}
                    </code>
                    <textarea
                      className="form-input-text"
                      aria-label="Signed owner approval"
                      value={signedToken}
                      onChange={(e) => setSignedToken(e.target.value)}
                    />
                    <button
                      className="btn-table-action"
                      onClick={async () => {
                        try {
                          const r = await fetch(
                            apiBase +
                              "/control/" +
                              encodeURIComponent(item.id) +
                              "/attest",
                            {
                              method: "POST",
                              credentials: "same-origin",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(JSON.parse(signedToken)),
                            },
                          );
                          if (!r.ok)
                            throw Error("Signed approval rejected or expired");
                          setObservation(await r.json());
                          setSignedToken("");
                        } catch (e) {
                          setEvidenceError(
                            e instanceof Error
                              ? e.message
                              : "Approval rejected",
                          );
                        }
                      }}
                    >
                      Record signed approval
                    </button>
                  </details>
                )}
              {observation !== null && (
                <pre>{JSON.stringify(observation, null, 2)}</pre>
              )}
              {evidenceError && <p role="alert">{evidenceError}</p>}
              <p>
                No additional proof transitions are assumed. Historical evidence
                is available in Proof & audit.
              </p>
            </div>
          )}
          {tab === "raw" && <pre>{JSON.stringify(item.data, null, 2)}</pre>}
        </>
      ) : (
        <div className="inspector-idle">
          <div className="inspector-target" aria-hidden="true">
            ◇
          </div>
          <h3>Context, without losing your place.</h3>
          <p>
            Select a company, proof event or record to inspect its source and
            evidence.
          </p>
          <small>○ Saved ≠ independently confirmed</small>
        </div>
      )}
    </aside>
  );
}
