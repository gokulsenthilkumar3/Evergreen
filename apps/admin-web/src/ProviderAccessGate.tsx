import { useState, useEffect, type FormEvent, type ReactNode } from "react";
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
        style={{ padding: 40, fontFamily: "system-ui, sans-serif" }}
        role="status"
      >
        Checking owner session...
      </main>
    );
  if (authorized)
    return (
      <>
        <button
          disabled={busy}
          onClick={() => void lock()}
          style={{
            position: "fixed",
            right: 18,
            bottom: 18,
            zIndex: 10000,
            padding: "9px 14px",
            borderRadius: 8,
            border: "1px solid #89a99c",
            background: "#fff",
            color: "#153c32",
            cursor: "pointer",
          }}
        >
          Lock provider console
        </button>
        {children}
      </>
    );
  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "#082e28",
        color: "#153c32",
        fontFamily: "system-ui, sans-serif",
        display: "grid",
        placeItems: "center",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <section
        style={{
          maxWidth: 430,
          width: "100%",
          background: "#fff",
          borderRadius: 20,
          padding: 32,
        }}
      >
        <p style={{ fontWeight: 800, letterSpacing: 2 }}>EVERGREEN OWNER</p>
        <h1>Provider sign-in</h1>
        <p>
          Use your protected owner access key. It is exchanged for an eight-hour
          protected session and is not saved in browser storage.
        </p>
        <form onSubmit={login}>
          <label htmlFor="provider-access-key">Owner access key</label>
          <input
            id="provider-access-key"
            type="password"
            autoComplete="off"
            autoFocus
            required
            disabled={busy}
            value={key}
            onChange={(event) => setKey(event.target.value)}
            style={{
              display: "block",
              width: "100%",
              boxSizing: "border-box",
              padding: 13,
              marginTop: 8,
              border: "1px solid #9eafa8",
              borderRadius: 8,
            }}
          />
          {error && (
            <p role="alert" style={{ color: "#b42318" }}>
              {error}
            </p>
          )}
          <button
            disabled={busy || !key.trim()}
            style={{
              marginTop: 18,
              width: "100%",
              padding: 13,
              border: 0,
              borderRadius: 8,
              background: "#08654e",
              color: "#fff",
              font: "inherit",
            }}
          >
            {busy ? "Verifying..." : "Open provider console"}
          </button>
        </form>
        <details style={{ fontSize: 12, marginTop: 24 }}>
          <summary style={{ cursor: "pointer" }}>
            Find your owner access key
          </summary>
          <p>
            Run this in your own PowerShell terminal from D:\Projects\EverGreen,
            under the Windows account that owns the protected services.
          </p>
          <code
            style={{
              display: "block",
              overflowWrap: "anywhere",
              padding: 12,
              background: "#eef4ee",
              borderRadius: 8,
            }}
          >
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
        <p style={{ fontSize: 13, marginTop: 24 }}>
          Retrieve this key in your own Windows terminal using the owner
          licensing guide. Do not put it into source code or frontend build
          variables.
        </p>
      </section>
    </main>
  );
}
