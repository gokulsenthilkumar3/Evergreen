import { skills } from '../catalog.mjs';

const actions = new Set(['inspect', 'edit', 'test', 'deploy', 'publish', 'migrate', 'delete-data', 'send-message', 'provision', 'accept-exception']);
const environments = new Set(['local', 'test', 'staging', 'production']);
const privileged = new Set(['deploy', 'publish', 'migrate', 'delete-data', 'send-message', 'provision', 'accept-exception']);
const digest = /^[a-f0-9]{64}$/;

/** Pure admission decision. Trusted hosts supply verified approvals and enforce it. */
export function plan(task, verifiedApproval = null, now = Date.now()) {
  if (!task || !actions.has(task.action) || !environments.has(task.environment) ||
      typeof task.target !== 'string' || !task.target.trim() ||
      !Array.isArray(task.domains) || !task.domains.length ||
      task.domains.some(domain => !skills.some(skill => skill.domains.includes(domain))) ||
      typeof task.operationalData !== 'boolean' || !Number.isFinite(now)) {
    return { state: 'DENIED', reason: 'Unknown or incomplete task contract', skills: [] };
  }
  const selected = new Set(['agent']);
  for (const s of skills) if (s.domains.some(domain => task.domains.includes(domain))) selected.add(s.id);
  if (task.action !== 'inspect') selected.add('quality');
  if (['deploy', 'publish'].includes(task.action)) { selected.add('release'); selected.add('recovery'); }
  if (['migrate', 'delete-data'].includes(task.action)) { selected.add('data'); selected.add('recovery'); }
  const mutation = task.action !== 'inspect';
  const needsApproval = privileged.has(task.action) || (mutation && (task.environment === 'production' || task.operationalData));
  if (!needsApproval) return { state: 'READY', reason: 'Within reversible local task scope', skills: [...selected] };
  if (!digest.test(task.artifactHash || '')) return { state: 'PREPARE_REVIEW', reason: 'Prepare a concrete SHA-256 artifact before approval', skills: [...selected] };
  const approval = verifiedApproval;
  const valid = approval && approval.decision === 'approved' && typeof approval.approver === 'string' && approval.approver.trim() &&
    ['action', 'environment', 'target', 'artifactHash', 'operationalData'].every(key => approval[key] === task[key]) &&
    Number.isFinite(Date.parse(approval.expiresAt)) && Date.parse(approval.expiresAt) > now;
  return { state: valid ? 'READY' : 'AWAITING_APPROVAL', reason: valid ? 'Exact, unexpired approval supplied by trusted host' : 'Exact action, target, data scope and artifact approval required', skills: [...selected] };
}
