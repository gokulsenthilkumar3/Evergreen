import { useSyncExternalStore } from "react";
let now = Date.now(),
  timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  if (!timer)
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((fn) => fn());
    }, 1000);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      clearInterval(timer);
      timer = undefined;
    }
  };
};
const idle = () => () => {};
export function useProofTime(enabled: boolean) {
  return useSyncExternalStore(
    enabled ? subscribe : idle,
    () => now,
    () => now,
  );
}
export function evidenceState(
  proof: {
    state: string;
    evidenceRef?: string | null;
    lastVerifiedAt?: string;
    ttlSeconds?: number;
  },
  now: number,
) {
  if (!["verified", "stale"].includes(proof.state)) return proof.state;
  if (!proof.evidenceRef || !proof.lastVerifiedAt) return "recorded";
  const age = (now - Date.parse(proof.lastVerifiedAt)) / 1000;
  if (!Number.isFinite(age) || age < -30) return "recorded";
  return age > Math.max(60, proof.ttlSeconds || 60) + 30 ? "stale" : "verified";
}
