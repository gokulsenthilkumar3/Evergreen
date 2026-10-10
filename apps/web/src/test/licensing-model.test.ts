/**
 * Licensing model — unit tests
 *
 * Tests the entitlement and plan logic that will govern what features
 * are available to each company based on their subscription plan.
 *
 * These are pure-function tests for the licensing model utilities.
 * The actual entitlement enforcement is server-side; these tests
 * validate the client-side display/hint logic.
 */
import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Plan definitions (mirrors the commercial model)
// ---------------------------------------------------------------------------

type Plan = 'SEED' | 'START' | 'GROW' | 'SCALE';

interface PlanLimits {
  sites: number;
  activeStaff: number;
  documentsPerMonth: number;
  modules: string[];
}

const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  SEED: {
    sites: 1,
    activeStaff: 2,
    documentsPerMonth: 300,
    modules: ['core', 'commerce'],
  },
  START: {
    sites: 1,
    activeStaff: 5,
    documentsPerMonth: 1000,
    modules: ['core', 'commerce', 'production', 'jobwork', 'import'],
  },
  GROW: {
    sites: 3,
    activeStaff: 15,
    documentsPerMonth: 10000,
    modules: ['core', 'commerce', 'production', 'jobwork', 'import', 'connectors', 'webhooks', 'warehouse', 'machines', 'quality', 'hr'],
  },
  SCALE: {
    sites: Infinity,
    activeStaff: Infinity,
    documentsPerMonth: Infinity,
    modules: ['core', 'commerce', 'production', 'jobwork', 'import', 'connectors', 'webhooks', 'warehouse', 'machines', 'quality', 'hr', 'multisite', 'sla'],
  },
};

function hasModule(plan: Plan, module: string): boolean {
  return PLAN_LIMITS[plan].modules.includes(module);
}

function isWithinLimits(
  plan: Plan,
  current: { sites: number; activeStaff: number; documentsThisMonth: number },
): { ok: boolean; violations: string[] } {
  const limits = PLAN_LIMITS[plan];
  const violations: string[] = [];

  if (current.sites > limits.sites) {
    violations.push(`Sites: ${current.sites} > ${limits.sites} (plan limit)`);
  }
  if (current.activeStaff > limits.activeStaff) {
    violations.push(`Staff: ${current.activeStaff} > ${limits.activeStaff} (plan limit)`);
  }
  if (current.documentsThisMonth > limits.documentsPerMonth) {
    violations.push(`Documents: ${current.documentsThisMonth} > ${limits.documentsPerMonth} (plan limit)`);
  }

  return { ok: violations.length === 0, violations };
}

function usageWarningThreshold(plan: Plan, docsPosted: number): 'ok' | 'warn' | 'limit' {
  const limit = PLAN_LIMITS[plan].documentsPerMonth;
  if (limit === Infinity) return 'ok';
  const ratio = docsPosted / limit;
  if (ratio >= 1.0) return 'limit';
  if (ratio >= 0.8) return 'warn';
  return 'ok';
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Plan limits — module access', () => {
  it('SEED plan includes core and commerce', () => {
    expect(hasModule('SEED', 'core')).toBe(true);
    expect(hasModule('SEED', 'commerce')).toBe(true);
  });

  it('SEED plan does NOT include production or connectors', () => {
    expect(hasModule('SEED', 'production')).toBe(false);
    expect(hasModule('SEED', 'connectors')).toBe(false);
    expect(hasModule('SEED', 'webhooks')).toBe(false);
  });

  it('START plan includes production and job work', () => {
    expect(hasModule('START', 'production')).toBe(true);
    expect(hasModule('START', 'jobwork')).toBe(true);
    expect(hasModule('START', 'import')).toBe(true);
  });

  it('START plan does NOT include connectors or webhooks', () => {
    expect(hasModule('START', 'connectors')).toBe(false);
    expect(hasModule('START', 'webhooks')).toBe(false);
  });

  it('GROW plan includes connectors, webhooks, warehouse, machines, quality, hr', () => {
    expect(hasModule('GROW', 'connectors')).toBe(true);
    expect(hasModule('GROW', 'webhooks')).toBe(true);
    expect(hasModule('GROW', 'warehouse')).toBe(true);
    expect(hasModule('GROW', 'machines')).toBe(true);
    expect(hasModule('GROW', 'quality')).toBe(true);
    expect(hasModule('GROW', 'hr')).toBe(true);
  });

  it('GROW plan does NOT include multi-site or SLA', () => {
    expect(hasModule('GROW', 'multisite')).toBe(false);
    expect(hasModule('GROW', 'sla')).toBe(false);
  });

  it('SCALE plan includes all modules', () => {
    const allModules = ['core', 'commerce', 'production', 'jobwork', 'import', 'connectors', 'webhooks', 'warehouse', 'machines', 'quality', 'hr', 'multisite', 'sla'];
    for (const mod of allModules) {
      expect(hasModule('SCALE', mod), `SCALE should include ${mod}`).toBe(true);
    }
  });
});

describe('Plan limits — usage enforcement', () => {
  it('SEED: 1 site, 2 staff, 300 docs — exactly at limit is ok', () => {
    const result = isWithinLimits('SEED', { sites: 1, activeStaff: 2, documentsThisMonth: 300 });
    expect(result.ok).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('SEED: 2 sites violates the limit', () => {
    const result = isWithinLimits('SEED', { sites: 2, activeStaff: 1, documentsThisMonth: 100 });
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.includes('Sites'))).toBe(true);
  });

  it('SEED: 3 staff violates the limit', () => {
    const result = isWithinLimits('SEED', { sites: 1, activeStaff: 3, documentsThisMonth: 100 });
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.includes('Staff'))).toBe(true);
  });

  it('SEED: 301 documents violates the limit', () => {
    const result = isWithinLimits('SEED', { sites: 1, activeStaff: 1, documentsThisMonth: 301 });
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.includes('Documents'))).toBe(true);
  });

  it('SCALE plan has no document limit violation regardless of usage', () => {
    const result = isWithinLimits('SCALE', {
      sites: 100,
      activeStaff: 500,
      documentsThisMonth: 999999,
    });
    expect(result.ok).toBe(true);
  });

  it('GROW: 3 sites exactly at limit is ok', () => {
    const result = isWithinLimits('GROW', { sites: 3, activeStaff: 10, documentsThisMonth: 5000 });
    expect(result.ok).toBe(true);
  });

  it('GROW: 4 sites violates the limit', () => {
    const result = isWithinLimits('GROW', { sites: 4, activeStaff: 10, documentsThisMonth: 5000 });
    expect(result.ok).toBe(false);
  });

  it('reports multiple violations simultaneously', () => {
    const result = isWithinLimits('SEED', { sites: 2, activeStaff: 5, documentsThisMonth: 500 });
    expect(result.ok).toBe(false);
    expect(result.violations.length).toBeGreaterThanOrEqual(3);
  });
});

describe('Usage warning thresholds', () => {
  it('returns ok when usage is below 80%', () => {
    expect(usageWarningThreshold('SEED', 200)).toBe('ok'); // 67% of 300
  });

  it('returns warn when usage is between 80% and 100%', () => {
    expect(usageWarningThreshold('SEED', 250)).toBe('warn'); // 83% of 300
    expect(usageWarningThreshold('SEED', 299)).toBe('warn'); // 99.7% of 300
  });

  it('returns limit when usage reaches 100%', () => {
    expect(usageWarningThreshold('SEED', 300)).toBe('limit'); // exactly 100%
    expect(usageWarningThreshold('SEED', 400)).toBe('limit'); // over 100%
  });

  it('SCALE plan always returns ok (no document limit)', () => {
    expect(usageWarningThreshold('SCALE', 99999999)).toBe('ok');
  });

  it('GROW plan warns at 8001 documents (80% of 10000)', () => {
    expect(usageWarningThreshold('GROW', 7999)).toBe('ok');
    expect(usageWarningThreshold('GROW', 8001)).toBe('warn');
    expect(usageWarningThreshold('GROW', 10001)).toBe('limit');
  });
});

describe('Plan upgrade rules', () => {
  it('SEED can be upgraded to START, GROW, or SCALE', () => {
    const planOrder: Plan[] = ['SEED', 'START', 'GROW', 'SCALE'];
    const seedIndex = planOrder.indexOf('SEED');
    const upgrades = planOrder.slice(seedIndex + 1);
    expect(upgrades).toEqual(['START', 'GROW', 'SCALE']);
  });

  it('upgrading plan does not lose access to modules from lower plan', () => {
    // Every module in SEED should also be in START
    for (const mod of PLAN_LIMITS.SEED.modules) {
      expect(hasModule('START', mod), `START should include SEED module: ${mod}`).toBe(true);
    }
    // Every module in START should also be in GROW
    for (const mod of PLAN_LIMITS.START.modules) {
      expect(hasModule('GROW', mod), `GROW should include START module: ${mod}`).toBe(true);
    }
    // Every module in GROW should also be in SCALE
    for (const mod of PLAN_LIMITS.GROW.modules) {
      expect(hasModule('SCALE', mod), `SCALE should include GROW module: ${mod}`).toBe(true);
    }
  });

  it('higher plans have equal or higher document limits', () => {
    const plans: Plan[] = ['SEED', 'START', 'GROW', 'SCALE'];
    for (let i = 1; i < plans.length; i++) {
      const prev = PLAN_LIMITS[plans[i - 1]].documentsPerMonth;
      const curr = PLAN_LIMITS[plans[i]].documentsPerMonth;
      expect(curr).toBeGreaterThanOrEqual(prev);
    }
  });

  it('higher plans have equal or higher staff limits', () => {
    const plans: Plan[] = ['SEED', 'START', 'GROW', 'SCALE'];
    for (let i = 1; i < plans.length; i++) {
      const prev = PLAN_LIMITS[plans[i - 1]].activeStaff;
      const curr = PLAN_LIMITS[plans[i]].activeStaff;
      expect(curr).toBeGreaterThanOrEqual(prev);
    }
  });
});
