import { useState, useEffect, type FormEvent, type ReactNode } from "react";
import "./gate.css";
const base = (
  (import.meta as { env?: { VITE_ADMIN_API_URL?: string } }).env
    ?.VITE_ADMIN_API_URL || "/admin-api"
).replace(/\/+$/, "");
export default function ProviderAccessGate({
  children,
}: {
  children: ReactNode;
}) {
  const [authorized, setAuthorized] = useState(false),
    [checking, setChecking] = useState(true);
  const [key, setKey] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    localStorage.removeItem("evergreen_provider_key");
    sessionStorage.removeItem("evergreen_provider_key");
    const controller = new AbortController();
    let active = true;
    const timer = setTimeout(() => controller.abort(), 8000);
    if (sessionStorage.getItem("evergreen_provider_locked") === "true")
      setChecking(false);
    else
      void fetch(base + "/auth/provider/session", {
        credentials: "same-origin",
        cache: "no-store",
        signal: controller.signal,
      })
        .then(async (response) => {
          const data = (await response.json()) as { authenticated?: boolean };
          if (active) setAuthorized(response.ok && data.authenticated === true);
        })
        .catch(() => {})
        .finally(() => {
          clearTimeout(timer);
          if (active) setChecking(false);
        });
    const lock = () => {
      sessionStorage.setItem("evergreen_provider_locked", "true");
      setAuthorized(false);
    };
    window.addEventListener("evergreen:provider-locked", lock);
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
      window.removeEventListener("evergreen:provider-locked", lock);
    };
  }, []);
  const login = async (event: FormEvent) => {
    event.preventDefault();
    if (busy || !key.trim()) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(base + "/auth/provider/session", {
        method: "POST",
        credentials: "same-origin",
        headers: { Authorization: "Bearer " + key.trim() },
        signal: AbortSignal.timeout(8000),
        cache: "no-store",
      });
      if (!response.ok)
        throw new Error(
          response.status === 401
            ? "The owner access key was not accepted."
            : "Provider access is unavailable. Check activation and API connectivity.",
        );
      const data = (await response.json()) as { authenticated?: boolean };
      if (data.authenticated !== true)
        throw new Error(
          "Provider sign-in could not be verified. Check the API address.",
        );
      sessionStorage.removeItem("evergreen_provider_locked");
      setKey("");
      setAuthorized(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not sign in. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  const lock = async () => {
    setBusy(true);
    setError("");
    sessionStorage.setItem("evergreen_provider_locked", "true");
    setAuthorized(false);
    try {
      const response = await fetch(base + "/auth/provider/session", {
        method: "DELETE",
        credentials: "same-origin",
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error("Sign-out could not be confirmed");
    } catch {
      setError(
        "Console locked locally. Server sign-out could not be confirmed. Retry when connected or clear the browser session for this site.",
      );
    } finally {
      setBusy(false);
    }
  };
  if (checking)
    return (
      <main
        className="gate-checking-root"
        role="status"
      >
        <div className="gate-checking-spinner" />
        Checking owner session...
      </main>
    );
  if (authorized)
    return (
      <>
        <button
          className="gate-lock-btn"
          disabled={busy}
          onClick={() => void lock()}
        >
          Lock provider console
        </button>
        {children}
      </>
    );
  return (
    <main className="gate-root">
      <section className="gate-card">
        <div className="gate-badge">
          <span className="gate-badge-dot" />
          EVERGREEN OWNER
        </div>
        <h1 className="gate-title">Provider sign-in</h1>
        <p className="gate-subtitle">
          Use your protected owner access key. It is exchanged for an eight-hour
          protected session and is not saved in browser storage.
        </p>
        <form onSubmit={login} className="gate-form">
          <label htmlFor="provider-access-key" className="gate-label">
            Owner access key
          </label>
          <input
            id="provider-access-key"
            className="gate-input"
            type="password"
            autoComplete="off"
            autoFocus
            required
            disabled={busy}
            value={key}
            placeholder="Paste your 64-character owner access key"
            onChange={(event) => setKey(event.target.value)}
          />
          {error && (
            <p role="alert" className="gate-alert">
              {error}
            </p>
          )}
          <button
            disabled={busy || !key.trim()}
            className="gate-submit-btn"
          >
            {busy ? "Verifying..." : "Open provider console"}
          </button>
        </form>
        <details className="gate-details">
          <summary className="gate-summary">
            Find your owner access key
          </summary>
          <p>
            Run this in your own PowerShell terminal from D:\Projects\EverGreen,
            under the Windows account that owns the protected services.
          </p>
          <code className="gate-code">
            {
              'node scripts/security/owner-license.cjs show-provider-key --key-dir "$env:LOCALAPPDATA\\EverGreen\\owner-keys"'
            }
          </code>
          <p>
            Copy the result here. Do not paste it into AI chat or source code.
            If a key already exists, retrieve it instead of generating a
            replacement.
          </p>
        </details>
        <p className="gate-footer">
          Retrieve this key in your own Windows terminal using the owner
          licensing guide. Do not put it into source code or frontend build
          variables.
        </p>
      </section>
    </main>
  );
}
