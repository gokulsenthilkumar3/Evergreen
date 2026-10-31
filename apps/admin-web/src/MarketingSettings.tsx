import { useEffect, useRef, useState } from "react";
type Settings = {
  salesEmail: string;
  marketingEmail: string;
  licensingEmail: string;
  supportEmail: string;
  opensAt: string;
  closesAt: string;
  version: number;
};
const initial: Settings = {
  salesEmail: "sales@evergreen.com",
  marketingEmail: "marketing@evergreen.com",
  licensingEmail: "licensing@evergreen.com",
  supportEmail: "support@evergreen.com",
  opensAt: "09:00",
  closesAt: "18:00",
  version: 0,
};
export default function MarketingSettings({ apiBase }: { apiBase: string }) {
  const [form, setForm] = useState(initial),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const pending = useRef(false);
  const [ready, setReady] = useState(false);
  const requestId = useRef(0);
  const load = async (signal?: AbortSignal) => {
    const id = ++requestId.current;
    setLoading(true);
    setReady(false);
    setError("");
    setNotice("");
    const current = () => id === requestId.current && !signal?.aborted;
    try {
      const response = await fetch(apiBase + "/control/marketing-settings", {
        credentials: "same-origin",
        signal: signal
          ? AbortSignal.any([signal, AbortSignal.timeout(8000)])
          : AbortSignal.timeout(8000),
        cache: "no-store",
      });
      if (!response.ok)
        throw new Error(
          "Contact settings could not be loaded. Check your owner session.",
        );
      const next = (await response.json()) as Settings;
      if (
        !Number.isInteger(next.version) ||
        typeof next.salesEmail !== "string"
      )
        throw new Error("Invalid contact settings response");
      if (current()) {
        setForm(next);
        setReady(true);
      }
    } catch (failure) {
      if (current())
        setError(
          failure instanceof Error
            ? failure.message
            : "Could not load settings",
        );
    } finally {
      if (current()) setLoading(false);
    }
  };
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => {
      controller.abort();
      requestId.current++;
    };
  }, [apiBase]);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (pending.current || !ready || loading) return;
    pending.current = true;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const {
        salesEmail,
        marketingEmail,
        licensingEmail,
        supportEmail,
        opensAt,
        closesAt,
        version,
      } = form;
      const response = await fetch(`${apiBase}/control/marketing-settings`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salesEmail,
          marketingEmail,
          licensingEmail,
          supportEmail,
          opensAt,
          closesAt,
          version,
        }),
        signal: AbortSignal.timeout(10000),
      });
      const data = (await response.json()) as Settings & { message?: unknown };
      if (!response.ok)
        throw new Error(
          typeof data.message === "string"
            ? data.message
            : "Settings could not be saved. Reload if another owner changed them.",
        );
      setForm(data);
      setNotice(
        "Contact details published. Open or refresh the marketing demo to see the saved values.",
      );
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not save contact settings",
      );
    } finally {
      pending.current = false;
      setSaving(false);
    }
  };
  return (
    <section>
      <div className="page-toolbar">
        <div>
          <h1 className="page-title">Marketing settings</h1>
          <p className="workspace-subtitle">
            Publish the public team addresses and office hours shown on the
            marketing demo. These settings do not create email accounts or
            configure mail delivery.
          </p>
        </div>
        <button
          className="btn-table-action"
          type="button"
          disabled={saving || loading}
          onClick={() => void load()}
        >
          Reload saved settings
        </button>
      </div>
      {loading && <p role="status">Loading contact details...</p>}
      {error && (
        <p role="alert" className="workspace-error">
          {error} Your input is retained.
        </p>
      )}
      {notice && (
        <p role="status" className="workspace-subtitle">
          {notice}
        </p>
      )}
      <form
        onSubmit={(event) => void save(event)}
        className="glass-panel"
        style={{ padding: 28, maxWidth: 820 }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
            gap: 22,
          }}
        >
          {(["sales", "marketing", "licensing", "support"] as const).map(
            (team) => {
              const key = `${team}Email` as keyof Pick<
                Settings,
                | "salesEmail"
                | "marketingEmail"
                | "licensingEmail"
                | "supportEmail"
              >;
              return (
                <label
                  key={team}
                  style={{ display: "grid", gap: 8, fontSize: 13 }}
                >
                  {team[0].toUpperCase() + team.slice(1)} team email
                  <input
                    className="form-input-text"
                    type="email"
                    required
                    maxLength={254}
                    value={form[key]}
                    disabled={loading || saving || !ready}
                    onChange={(event) =>
                      setForm({ ...form, [key]: event.target.value })
                    }
                  />
                </label>
              );
            },
          )}
          <label style={{ display: "grid", gap: 8, fontSize: 13 }}>
            Opens at (IST)
            <input
              className="form-input-text"
              type="time"
              required
              value={form.opensAt}
              disabled={loading || saving || !ready}
              onChange={(event) =>
                setForm({ ...form, opensAt: event.target.value })
              }
            />
          </label>
          <label style={{ display: "grid", gap: 8, fontSize: 13 }}>
            Closes at (IST)
            <input
              className="form-input-text"
              type="time"
              required
              value={form.closesAt}
              disabled={loading || saving || !ready}
              onChange={(event) =>
                setForm({ ...form, closesAt: event.target.value })
              }
            />
          </label>
        </div>
        <p className="workspace-subtitle">
          Timezone: Asia/Kolkata. Working days and response-time commitments are
          not assumed. Public responses contain only contact fields and the
          settings version.
        </p>
        <button
          type="submit"
          className="btn-provision-trigger"
          disabled={loading || saving || !ready}
        >
          {saving ? "Publishing..." : "Publish contact details"}
        </button>
      </form>
    </section>
  );
}
