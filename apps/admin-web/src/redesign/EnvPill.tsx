import { useEffect, useState } from "react";
type Health = {
  host: string;
  dbPath: string;
  instance: string;
  dbFingerprint: string;
  latencyMs: number;
  checkedAt: string;
};
export default function EnvPill({ apiBase }: { apiBase: string }) {
  const [data, setData] = useState<Health | null>(null),
    [misses, setMisses] = useState(0);
  useEffect(() => {
    const c = new AbortController();
    let pending = false;
    const load = async () => {
      if (pending) return;
      pending = true;
      try {
        const r = await fetch(apiBase + "/control/health", {
          credentials: "same-origin",
          signal: AbortSignal.any([c.signal, AbortSignal.timeout(5000)]),
          cache: "no-store",
        });
        if (!r.ok) throw Error();
        const next = await r.json();
        if (!next.dbFingerprint) throw Error();
        if (!c.signal.aborted) {
          setData(next);
          setMisses(0);
        }
      } catch {
        if (!c.signal.aborted) setMisses((x) => x + 1);
      } finally {
        pending = false;
      }
    };
    void load();
    const timer = setInterval(() => {
      if (!document.hidden) void load();
    }, 15000);
    return () => {
      c.abort();
      clearInterval(timer);
    };
  }, [apiBase]);
  return (
    <span
      className="environment-label env-pill"
      data-state={misses >= 3 ? "stale" : data ? "up" : "connecting"}
      title={
        data
          ? `${data.dbPath}\nInstance ${data.instance}\nDB ${data.dbFingerprint}\nChecked ${data.checkedAt}`
          : "Waiting for the authenticated provider API"
      }
    >
      <i />
      {data
        ? `${data.host} · ${data.dbPath.split(/[\\/]/).pop()}`
        : "Provider connecting…"}
      <small>
        {misses >= 3 ? "stale" : data ? `${data.latencyMs} ms` : "—"}
      </small>
      {misses >= 10 && (
        <span role="alert">Provider monitoring unavailable</span>
      )}
    </span>
  );
}
