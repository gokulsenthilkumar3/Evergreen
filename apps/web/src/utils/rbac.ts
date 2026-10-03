export const ROLE_HIERARCHY: Record<string, string[]> = {
  VIEWER: ['VIEWER'],
  MODIFIER: ['MODIFIER', 'VIEWER'],
  ADMIN: ['ADMIN', 'MODIFIER', 'VIEWER'],
};

export const canAccessRole = (userRole: string | undefined, requiredRole: string) => {
  const normalized = (userRole || 'VIEWER').toUpperCase();
  const normalizedRequiredRole = requiredRole.toUpperCase();

  // Unknown roles must fail closed. Falling back to the supplied role allowed a
  // malformed or newly introduced role to grant itself access accidentally.
  return (ROLE_HIERARCHY[normalized] || []).includes(normalizedRequiredRole);
};

export const canManageUsers = (userRole: string | undefined) => {
  const normalized = (userRole || 'VIEWER').toUpperCase();
  return normalized === 'ADMIN';
};
