import { evidenceState, useProofTime } from './proof-clock';
export type ProofState =
  | "recorded"
  | "requested"
  | "executed"
  | "verified"
  | "failed"
  | "stale";
export type Proof = {
  state: ProofState;
  reason: string;
  source: string;
  at: string;
  evidenceRef?: string | null;
  lastVerifiedAt?: string;
  ttlSeconds?: number;
  scope?: string;
};
const labels = {
  recorded: "Saved",
  requested: "Queued",
  executed: "Ran",
  verified: "Confirmed",
  failed: "Failed",
  stale: "Expired",
};
const glyphs = {
  recorded: "○",
  requested: "◔",
  executed: "◑",
  verified: "●",
  failed: "✕",
  stale: "◌",
};
export default function ProofBadge({ proof }: { proof?: Proof }) {
  const now=useProofTime(!!proof?.lastVerifiedAt);
  const state=(proof?evidenceState(proof,now):'recorded') as ProofState;
  return (
    <span
      className="proof-badge"
      data-proof={state}
      data-evidence={proof?.evidenceRef || undefined}
      title={
        proof?.reason || "Saved record; no independent execution evidence."
      }
    >
      <span aria-hidden="true">{glyphs[state]}</span>
      {labels[state]}
    </span>
  );
}
