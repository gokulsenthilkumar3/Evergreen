import test from 'node:test';
import assert from 'node:assert/strict';
import { plan } from './planner.mjs';

const now = Date.parse('2026-10-04T12:00:00Z');
const task = { action: 'deploy', environment: 'production', target: 'evergreen-web-staging-example', artifactHash: 'a'.repeat(64), operationalData: false, domains: ['Frontend'] };
const approval = { ...task, decision: 'approved', approver: 'owner@example.invalid', expiresAt: '2026-10-04T12:30:00Z' };

test('reversible local UI edits route without unnecessary approval', () => {
  const result = plan({ ...task, action: 'edit', environment: 'local' });
  assert.equal(result.state, 'READY');
  assert.ok(result.skills.includes('frontend') && result.skills.includes('quality'));
});
test('production deploy is held until exact approval', () => {
  assert.equal(plan(task, null, now).state, 'AWAITING_APPROVAL');
  assert.equal(plan(task, approval, now).state, 'READY');
});
test('artifact, target, action, environment and data scope changes invalidate approval', () => {
  for (const change of [{ artifactHash: 'b'.repeat(64) }, { target: 'another-business' }, { action: 'publish' }, { environment: 'staging' }, { operationalData: true }]) {
    assert.equal(plan({ ...task, ...change }, approval, now).state, 'AWAITING_APPROVAL');
  }
});
test('expired, malformed and rejected approvals do not authorize execution', () => {
  for (const change of [{ expiresAt: '2026-10-04T11:00:00Z' }, { expiresAt: 'invalid' }, { approver: '' }, { decision: 'rejected' }]) {
    assert.equal(plan(task, { ...approval, ...change }, now).state, 'AWAITING_APPROVAL');
  }
});
test('missing artifact prepares review before asking for approval', () => {
  assert.equal(plan({ ...task, artifactHash: '' }, null, now).state, 'PREPARE_REVIEW');
});
test('tests against operational records need approval even locally', () => {
  assert.equal(plan({ ...task, action: 'test', environment: 'local', operationalData: true }, null, now).state, 'AWAITING_APPROVAL');
});
test('unknown actions, environments and domains fail closed', () => {
  for (const change of [{ action: 'exec-anything' }, { environment: 'prod-ish' }, { domains: ['unknown'] }, { domains: [] }, { operationalData: undefined }]) {
    assert.equal(plan({ ...task, ...change }).state, 'DENIED');
  }
});
test('migration routes data recovery and test skills', () => {
  const result = plan({ ...task, action: 'migrate', domains: ['Database'] }, null, now);
  assert.ok(['data', 'recovery', 'quality'].every(skill => result.skills.includes(skill)));
});
