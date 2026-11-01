import { uiText, useUiLanguage } from "../i18n";
import {
  useCallback,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
export default function InstallationGate({
  url,
  children,
}: {
  url: string;
  children: ReactNode;
}) {
  useUiLanguage();
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
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        boxSizing: "border-box",
        background: "#f3f7f5",
        color: "#153c32",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <section
        style={{
          maxWidth: 460,
          width: "100%",
          padding: 32,
          border: "1px solid #ceded6",
          borderRadius: 20,
          background: "#fff",
        }}
        aria-live="polite"
      >
        <p style={{ letterSpacing: 2, fontWeight: 800 }}>{uiText("EVERGREEN")}</p>
        <h1>
          {state === "checking"
            ? uiText("Checking installation access")
            : uiText("Installation authorization required")}
        </h1>
        <p>
          {state === "checking"
            ? uiText("Verifying this workspace before opening your data.")
            : uiText("A valid owner-issued licence is required. Contact the EverGreen owner to activate or renew this installation. If already activated, check that the API is running.")}
        </p>
        {state === "locked" && (
          <button
            onClick={() => {
              setState("checking");
              void check();
            }}
            style={{
              padding: "12px 20px",
              borderRadius: 8,
              border: 0,
              background: "#08654e",
              color: "white",
              font: "inherit",
              cursor: "pointer",
            }}
          >
            {uiText("Check again ")}</button>
        )}
      </section>
    </main>
  );
}
