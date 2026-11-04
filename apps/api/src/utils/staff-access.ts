export interface StaffRule { method: string; path: string; effect: string; expiresAt?: Date | string | null }
/** Restrictions only: an ALLOW rule never elevates the built-in role or licence. */
export function staffRouteAllowed(scoped: boolean, rules: StaffRule[], method: string, path: string, now = Date.now()): boolean {
  const verb = method === 'HEAD' ? 'GET' : method;
  const matches = rules.filter(rule => (!rule.expiresAt || new Date(rule.expiresAt).getTime() > now) && (rule.method === '*' || rule.method === verb) && (rule.path === path || rule.path.endsWith('/*') && (path === rule.path.slice(0,-2) || path.startsWith(rule.path.slice(0,-1)))));
  if (matches.some(rule => rule.effect === 'DENY')) return false;
  return !scoped || matches.some(rule => rule.effect === 'ALLOW');
}
