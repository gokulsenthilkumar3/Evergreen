/** Keep sessions isolated by origin so customer subdomains and custom domains never share credentials. */
const storageKey = (key: string) => `${window.location.origin}:${key}`;
export const getToken = () =>
  sessionStorage.getItem(storageKey("token")) || localStorage.getItem(storageKey("token"));
export const getStoredUser = () =>
  sessionStorage.getItem(storageKey("user")) || localStorage.getItem(storageKey("user"));
export function clearAuth() {
  for (const storage of [sessionStorage, localStorage]) {
    storage.removeItem(storageKey("token"));
    storage.removeItem(storageKey("user"));
  }
}
export function saveSession(token: string, user: unknown, remember: boolean) {
  clearAuth();
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(storageKey("token"), token);
  storage.setItem(storageKey("user"), JSON.stringify(user));
}
export function saveUser(user: unknown) {
  const storage = sessionStorage.getItem(storageKey("token"))
    ? sessionStorage
    : localStorage;
  storage.setItem(storageKey("user"), JSON.stringify(user));
}
