/** Company workspace preferences, not authorization or paid entitlements. */
export const BUSINESS_MODES = ['INTEGRATED', 'WAREHOUSE', 'MILL', 'PROCESSING'] as const;
export type BusinessMode = typeof BUSINESS_MODES[number];
export const WORKSPACE_MODES = ['GUIDED', 'FULL'] as const;
export type WorkspaceMode = typeof WORKSPACE_MODES[number];

export interface CompanyProfile {
  businessMode: BusinessMode;
  workspaceMode: WorkspaceMode;
}

export const BUSINESS_MODE_LABELS: Record<BusinessMode, string> = {
  INTEGRATED: 'Warehouses, mills and processing',
  WAREHOUSE: 'Warehousing and trading',
  MILL: 'Mill operations',
  PROCESSING: 'Processing and job work',
};

const ESSENTIAL_PAGES = new Set([
  'dashboard',
  'workspace',
  'business',
  'reports',
  'settings',
  'tutorial',
  'helpdesk',
  'users',
  'user-management',
  'sessions',
  'security',
  'integrations',
]);

const MODE_PAGES: Record<BusinessMode, readonly string[]> = {
  INTEGRATED: ['inward', 'inventory', 'production', 'jobwork', 'outward', 'yarnwarehouse', 'workflows', 'today', 'warehouse'],
  WAREHOUSE: ['inventory', 'yarnwarehouse', 'outward', 'workflows', 'today', 'warehouse'],
  MILL: ['inward', 'inventory', 'production', 'outward', 'costing', 'yarnmachine', 'yarnquality', 'today'],
  PROCESSING: ['jobwork', 'workflows', 'costing', 'yarnquality'],
};

const WAREHOUSE_FORBIDDEN = new Set(['production', 'production-entry', 'inward', 'yarnmachine', 'yarnquality', 'yarnhr']);
const PROCESSING_FORBIDDEN = new Set(['inward', 'production', 'production-entry', 'yarnmachine', 'yarnwarehouse']);
const MILL_FORBIDDEN = new Set(['jobwork']);
const ADMIN_ONLY_PAGES = new Set(['users', 'user-management', 'security', 'sessions']);
const ADVANCED_IN_GUIDED = new Set(['warehouse']);

/** Unknown or pre-upgrade preferences preserve the existing full workspace. */
export function normalizeCompanyProfile(value?: Partial<CompanyProfile> | null): CompanyProfile {
  let mode = value?.businessMode as string | undefined;
  if (mode === 'WAREHOUSE_ONLY' || mode === 'TRADER') mode = 'WAREHOUSE';
  if (mode === 'MILL_ONLY') mode = 'MILL';
  if (mode === 'PROCESSING_ONLY') mode = 'PROCESSING';

  return {
    businessMode: BUSINESS_MODES.includes(mode as BusinessMode) ? (mode as BusinessMode) : 'INTEGRATED',
    workspaceMode: WORKSPACE_MODES.includes(value?.workspaceMode as WorkspaceMode) ? value!.workspaceMode! : 'FULL',
  };
}

/**
 * Navigation only. Existing records and direct routes remain accessible under RBAC.
 * Supports both:
 *  - isCompanyPageVisible(page, profile)
 *  - isCompanyPageVisible(page, role, businessMode, workspaceMode)
 */
export function isCompanyPageVisible(
  page: string,
  roleOrProfile?: string | Partial<CompanyProfile> | null,
  businessModeArg?: string,
  workspaceModeArg?: string,
): boolean {
  let role: string | undefined;
  let rawMode: string | undefined;
  let rawWorkspace: string | undefined;

  if (typeof roleOrProfile === 'string') {
    role = roleOrProfile;
    rawMode = businessModeArg;
    rawWorkspace = workspaceModeArg;
  } else if (roleOrProfile && typeof roleOrProfile === 'object') {
    rawMode = (roleOrProfile as any).businessMode;
    rawWorkspace = (roleOrProfile as any).workspaceMode;
  }

  // Admin access control when role is explicitly passed
  if (role && ADMIN_ONLY_PAGES.has(page) && role !== 'ADMIN') {
    return false;
  }

  const profile = normalizeCompanyProfile({
    businessMode: rawMode as any,
    workspaceMode: rawWorkspace as any,
  });

  // Mode-specific forbidden pages apply regardless of workspaceMode
  if (profile.businessMode === 'WAREHOUSE' && WAREHOUSE_FORBIDDEN.has(page)) {
    return false;
  }
  if (profile.businessMode === 'PROCESSING' && PROCESSING_FORBIDDEN.has(page)) {
    return false;
  }
  if (profile.businessMode === 'MILL' && MILL_FORBIDDEN.has(page)) {
    return false;
  }

  // Dashboard is visible across all configurations
  if (page === 'dashboard') {
    return true;
  }

  // Guided workspace hides advanced modules
  if (profile.workspaceMode === 'GUIDED' && ADVANCED_IN_GUIDED.has(page)) {
    return false;
  }

  if (profile.workspaceMode === 'FULL') {
    return true;
  }

  return ESSENTIAL_PAGES.has(page) || MODE_PAGES[profile.businessMode]?.includes(page);
}
