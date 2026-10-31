/** Keep shared-device sessions in this tab; persistent sessions retain the existing storage format. */
export const getToken = () =>
  sessionStorage.getItem("token") || localStorage.getItem("token");
export const getStoredUser = () =>
  sessionStorage.getItem("user") || localStorage.getItem("user");
export function clearAuth() {
  for (const storage of [sessionStorage, localStorage]) {
    storage.removeItem("token");
    storage.removeItem("user");
  }
}
export function saveSession(token: string, user: unknown, remember: boolean) {
  clearAuth();
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem("token", token);
  storage.setItem("user", JSON.stringify(user));
}
export function saveUser(user: unknown) {
  const storage = sessionStorage.getItem("token")
    ? sessionStorage
    : localStorage;
  storage.setItem("user", JSON.stringify(user));
}
