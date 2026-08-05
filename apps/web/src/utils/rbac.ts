export const ROLE_HIERARCHY: Record<string, string[]> = {
  VIEWER: ['VIEWER'],
  MODIFIER: ['MODIFIER', 'VIEWER'],
  AUTHOR: ['AUTHOR', 'MODIFIER', 'VIEWER'],
  ADMIN: ['ADMIN', 'AUTHOR', 'MODIFIER', 'VIEWER'],
};

export const canAccessRole = (userRole: string | undefined, requiredRole: string) => {
  const normalized = (userRole || 'VIEWER').toUpperCase();
  return (ROLE_HIERARCHY[normalized] || [normalized]).includes(requiredRole);
};

export const canManageUsers = (userRole: string | undefined) => {
  const normalized = (userRole || 'VIEWER').toUpperCase();
  return ['AUTHOR', 'ADMIN'].includes(normalized);
};
