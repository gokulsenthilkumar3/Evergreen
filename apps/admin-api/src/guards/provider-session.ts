import { createHash, randomBytes } from 'node:crypto';
const sessions = new Map<string, { expires: number; credential: string }>();
const digest = (value: string) =>
  createHash('sha256').update(value).digest('hex');
export const PROVIDER_COOKIE = 'evergreen_provider_session';
export function createProviderSession(credential: string): string {
  const now = Date.now();
  for (const [id, session] of sessions)
    if (session.expires <= now) sessions.delete(id);
  if (sessions.size >= 1000) throw new Error('Provider session limit reached');
  const token = randomBytes(32).toString('base64url');
  sessions.set(digest(token), {
    expires: now + 8 * 3600000,
    credential: digest(credential),
  });
  return token;
}
function tokenFrom(cookie?: string): string {
  return (
    String(cookie || '')
      .split(';')
      .map((value) => value.trim())
      .find((value) => value.startsWith(PROVIDER_COOKIE + '='))
      ?.slice(PROVIDER_COOKIE.length + 1) || ''
  );
}
export function validateProviderSession(
  cookie: string | undefined,
  credential: string,
): boolean {
  const token = tokenFrom(cookie);
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return false;
  const id = digest(token),
    session = sessions.get(id);
  if (
    !session ||
    session.expires <= Date.now() ||
    session.credential !== digest(credential)
  ) {
    sessions.delete(id);
    return false;
  }
  return true;
}
export function revokeProviderSession(cookie?: string) {
  sessions.delete(digest(tokenFrom(cookie)));
}
