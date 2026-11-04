import {
  useCallback,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import "./gate.css";
export default function InstallationGate({
  url,
  children,
}: {
  url: string;
  children: ReactNode;
}) {
  const [state, setState] = useState<"checking" | "active" | "locked">(
    "checking",
  );
  const sequence = useRef(0);
  const check = useCallback(
    async (signal?: AbortSignal) => {
      const request = ++sequence.current;
      const deadline = new AbortController();
      const cancel = () => deadline.abort();
      signal?.addEventListener("abort", cancel, { once: true });
      const timer = setTimeout(cancel, 8000);
      try {
        const response = await fetch(url, {
          signal: deadline.signal,
          cache: "no-store",
          credentials: "same-origin",
        });
        const data = (await response.json()) as { active?: boolean };
        if (!signal?.aborted && request === sequence.current)
          setState(response.ok && data.active === true ? "active" : "locked");
      } catch {
        if (!signal?.aborted && request === sequence.current)
          setState("locked");
      } finally {
        clearTimeout(timer);
        signal?.removeEventListener("abort", cancel);
      }
    },
    [url],
  );
  useEffect(() => {
    const controller = new AbortController();
    void check(controller.signal);
    const timer = setInterval(() => {
      void check(controller.signal);
    }, 30000);
    const focus = () => {
      void check(controller.signal);
    };
    window.addEventListener("focus", focus);
    return () => {
      controller.abort();
      clearInterval(timer);
      window.removeEventListener("focus", focus);
    };
  }, [check]);
  if (state === "active") return children;
  return (
    <main className="gate-root">
      <section className="gate-card" aria-live="polite">
        <div className="gate-badge">
          <span className="gate-badge-dot" />
          EVERGREEN
        </div>
        <h1 className="gate-title">
          {state === "checking"
            ? "Checking installation access"
            : "Installation authorization required"}
        </h1>
        <p className="gate-subtitle">
          {state === "checking"
            ? "Verifying this workspace before opening your data."
            : "A valid owner-issued licence is required. Contact the EverGreen owner to activate or renew this installation. If already activated, check that the API is running."}
        </p>
        {state === "locked" && (
          <button
            onClick={() => {
              setState("checking");
              void check();
            }}
            className="gate-submit-btn"
          >
            Check again
          </button>
        )}
      </section>
    </main>
  );
}
