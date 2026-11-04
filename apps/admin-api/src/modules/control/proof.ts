/** Server-owned evidence classification. Editable status/payload never grants proof. */
export type ProofState =
  | 'recorded'
  | 'requested'
  | 'executed'
  | 'verified'
  | 'failed'
  | 'stale';
export interface Proof {
  state: ProofState;
  reason: string;
  source: string;
  at: string;
}
export function recordedProof(at: Date | string): Proof {
  return {
    state: 'recorded',
    reason:
      'Saved in the provider database. No independent execution evidence.',
    source: 'provider.database',
    at: new Date(at).toISOString(),
  };
}
export function jobProof(job: {
  status: string;
  runId?: string | null;
  updatedAt: Date | string;
}): Proof {
  const at = new Date(job.updatedAt).toISOString();
  if (['FAILED', 'CANCELLED'].includes(job.status))
    return {
      state: 'failed',
      source: 'provider.release-job',
      at,
      reason: 'The recorded execution job failed or was cancelled.',
    };
  if (['SUCCEEDED','SUCCESS'].includes(job.status) && job.runId)
    return {
      state: 'executed',
      source: 'provider.release-job',
      at,
      reason:
        'Workflow success recorded. Independent customer read-back has not confirmed installation.',
    };
  return {
    state: 'requested',
    source: 'provider.release-job',
    at,
    reason:
      'Execution intent recorded; completion is not independently confirmed.',
  };
}
