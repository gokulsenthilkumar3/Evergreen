export const ROLE_HIERARCHY: Record<string, string[]> = {
  VIEWER: ['VIEWER'],
  MODIFIER: ['MODIFIER', 'VIEWER'],
  ADMIN: ['ADMIN', 'MODIFIER', 'VIEWER'],
};

export const normalizeRole = (role?: string | null) => {
  const normalized = (role || 'VIEWER').toUpperCase();
  return normalized in ROLE_HIERARCHY ? normalized : 'VIEWER';
};
