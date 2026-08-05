export const ROLE_HIERARCHY: Record<string, string[]> = {
  VIEWER: ['VIEWER'],
  MODIFIER: ['MODIFIER', 'VIEWER'],
  AUTHOR: ['AUTHOR', 'MODIFIER', 'VIEWER'],
  ADMIN: ['ADMIN', 'AUTHOR', 'MODIFIER', 'VIEWER'],
};

export const normalizeRole = (role?: string | null) =>
  (role || 'VIEWER').toUpperCase();
