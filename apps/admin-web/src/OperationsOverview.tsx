import { useMemo } from "react";
import ProofBadge from "./redesign/ProofBadge";
import type { RecordItem } from "./control-data";

type Company = {
  id: string;
  name: string;
  cloudProvider: string;
  status: string;
  lastSyncAt?: string | null;
  activeStaff: number;
  maxUsers: number;
  docsPosted: number;
  maxDocsPerMonth: number;
};
type Destination = "TENANTS" | "PROOF" | "DATABASES" | "APIS";
type Props = {
  companies: Company[];
  records: RecordItem[];
  updatedAt: string;
  onRefresh: () => void;
  onNavigate: (page: Destination) => void;
  onInspect: (company: Company) => void;
};
const cloudNames: Record<string, string> = {
  GCP: "Google Cloud",
  AWS: "Amazon Web Services",
  AZURE: "Microsoft Azure",
  LOCAL_VM: "Private infrastructure",
};
const cloudColors = ["#8d9dff", "#49cbb0", "#eab76d", "#d393c7", "#719ec7"];
const nice = (value: string) => value.toLowerCase().replaceAll("_", " ");
const number = (value: number) => new Intl.NumberFormat().format(value);

export default function OperationsOverview({
  companies,
  records,
  updatedAt,
  onRefresh,
  onNavigate,
  onInspect,
}: Props) {
  const clouds = useMemo(
    () =>
      Object.entries(
        companies.reduce((out: Record<string, number>, c) => {
          out[c.cloudProvider] = (out[c.cloudProvider] || 0) + 1;
          return out;
        }, {}),
      ).sort((a, b) => b[1] - a[1]),
    [companies],
  );
  const recent = useMemo(
    () =>
      [...records]
        .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
        .slice(0, 5),
    [records],
  );
  const active = companies.filter((c) => c.status === "ACTIVE").length;
  const attention = companies.filter(
    (c) =>
      c.status !== "ACTIVE" ||
      !c.lastSyncAt ||
      Date.now() - Date.parse(c.lastSyncAt) > 86400000,
  );
  const docs = companies.reduce((n, c) => n + c.docsPosted, 0);
  const capacity = companies.reduce((n, c) => n + c.maxDocsPerMonth, 0);
  const circumference = 2 * Math.PI * 64;
  let offset = 0;
  return (
    <section className="deck">
      <header className="deck-heading">
        <div>
          <span className="deck-eyebrow">WORKSPACE OVERVIEW</span>
          <h1>
            Command deck
            <span className="deck-title-dot" aria-hidden="true">
              .
            </span>
          </h1>
          <p>A clear view of your companies, capacity and next decisions.</p>
        </div>
        <button className="deck-button" onClick={onRefresh}>
          <span aria-hidden="true">↻</span> Refresh data
        </button>
      </header>
      <div className="deck-hero">
        <div className="deck-hero-copy">
          <span className="deck-overline">
            <i /> YOUR PROVIDER WORKSPACE
          </span>
          <h2>
            Every company.
            <br />
            <em>One perspective.</em>
          </h2>
          <p>
            See where your estate stands. Follow the evidence from a saved
            record to a confirmed outcome.
          </p>
          <div className="deck-hero-actions">
            <button
              className="deck-button deck-button-primary"
              onClick={() => onNavigate("TENANTS")}
            >
              Explore companies <span aria-hidden="true">↗</span>
            </button>
            <button
              className="deck-text-button"
              onClick={() => onNavigate("PROOF")}
            >
              Review evidence <span aria-hidden="true">→</span>
            </button>
          </div>
          <div className="deck-data-note">
            <span className="deck-note-line" />
            {updatedAt
              ? "Latest provider response " +
                new Date(updatedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Awaiting provider response"}
            <span>·</span> Registry data
          </div>
        </div>
        <div className="deck-estate-art" aria-hidden="true">
          <div className="deck-art-grid" />
          <div className="deck-orbit deck-orbit-a" />
          <div className="deck-orbit deck-orbit-b" />
          <div className="deck-art-core">
            <svg viewBox="0 0 100 100">
              <path d="M50 8 86 29v42L50 92 14 71V29Z" />
              <path d="m14 29 36 22 36-22M50 51v41M50 8v43" />
              <path
                className="deck-art-inner"
                d="m50 29 19 11v22L50 73 31 62V40Z"
              />
            </svg>
            <span>EVERGREEN</span>
          </div>
          <div className="deck-satellite sat-one">
            <i className="sat-icon">◈</i>
            <div>
              <small>Company registry</small>
              <strong>{number(companies.length)} installations</strong>
            </div>
          </div>
          <div className="deck-satellite sat-two">
            <i className="sat-icon">▤</i>
            <div>
              <small>Provider ledger</small>
              <strong>{number(records.length)} records</strong>
            </div>
          </div>
          <div className="deck-satellite sat-three">
            <i className="sat-icon">⌁</i>
            <div>
              <small>Registered hosts</small>
              <strong>{clouds.length} environments</strong>
            </div>
          </div>
          <span className="deck-art-caption">
            REGISTERED RELATIONSHIPS · CONNECTIVITY NOT INFERRED
          </span>
        </div>
      </div>
      <div className="deck-stat-row">
        {[
          {
            label: "Registered companies",
            value: companies.length,
            sub: "Across " + clouds.length + " host environments",
            icon: "◈",
            className: "lilac",
          },
          {
            label: "Active licences",
            value: active,
            sub: companies.length
              ? Math.round((active / companies.length) * 100) +
                "% of registered companies"
              : "No licences registered",
            icon: "◇",
            className: "mint",
          },
          {
            label: "Documents reported",
            value: docs,
            sub: "Of " + number(capacity) + " combined monthly quota",
            icon: "▤",
            className: "sand",
          },
          {
            label: "Needs your review",
            value: attention.length,
            sub: "Licence or synchronization review",
            icon: "↗",
            className: "rose",
          },
        ].map((stat) => (
          <article className={"deck-stat " + stat.className} key={stat.label}>
            <div>
              <span>{stat.label}</span>
              <i aria-hidden="true">{stat.icon}</i>
            </div>
            <strong>{number(stat.value)}</strong>
            <small>{stat.sub}</small>
          </article>
        ))}
      </div>
      <div className="deck-middle">
        <article className="deck-panel deck-cloud-panel">
          <header>
            <div>
              <span className="deck-eyebrow">INFRASTRUCTURE</span>
              <h2>Your cloud footprint</h2>
            </div>
            <span className="deck-tag">Registry</span>
          </header>
          <div className="deck-cloud-content">
            <div className="deck-donut">
              <svg
                viewBox="0 0 160 160"
                role="img"
                aria-label={
                  companies.length +
                  " registered companies across " +
                  clouds.length +
                  " host environments"
                }
              >
                <circle
                  cx="80"
                  cy="80"
                  r="64"
                  fill="none"
                  stroke="var(--studio-track)"
                  strokeWidth="13"
                />
                {clouds.map(([name, count], i) => {
                  const dash =
                    (count / (companies.length || 1)) * circumference;
                  const previous = offset;
                  offset += dash;
                  return (
                    <circle
                      key={name}
                      cx="80"
                      cy="80"
                      r="64"
                      fill="none"
                      stroke={cloudColors[i % cloudColors.length]}
                      strokeWidth="13"
                      strokeDasharray={
                        Math.max(0, dash - 5) +
                        " " +
                        (circumference - Math.max(0, dash - 5))
                      }
                      strokeDashoffset={-previous}
                      transform="rotate(-90 80 80)"
                    />
                  );
                })}
              </svg>
              <div>
                <strong>{companies.length}</strong>
                <span>companies</span>
              </div>
            </div>
            <ul className="deck-cloud-legend">
              {clouds.map(([name, count], i) => (
                <li key={name}>
                  <span>
                    <i
                      style={{
                        background: cloudColors[i % cloudColors.length],
                      }}
                    />
                    {cloudNames[name] || name}
                  </span>
                  <strong>
                    {count}
                    <small>
                      {Math.round((count / (companies.length || 1)) * 100)}%
                    </small>
                  </strong>
                </li>
              ))}
              {!clouds.length && <li>No hosting records yet.</li>}
            </ul>
          </div>
          <footer>
            Hosting choices come from company records, not live cloud health.
          </footer>
        </article>
        <article className="deck-panel">
          <header>
            <div>
              <span className="deck-eyebrow">EVIDENCE TRAIL</span>
              <h2>Recently recorded</h2>
            </div>
            <button
              className="deck-text-button"
              onClick={() => onNavigate("PROOF")}
            >
              View all ↗
            </button>
          </header>
          <div className="deck-recent">
            {recent.map((record, i) => (
              <div key={record.id} className="deck-recent-row">
                <span className="deck-event-mark" data-tone={i % 3}>
                  {record.kind.slice(0, 1)}
                </span>
                <div>
                  <strong>{record.title}</strong>
                  <small>
                    {nice(record.kind)} ·{" "}
                    {new Date(record.updatedAt).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </small>
                </div>
                <ProofBadge proof={record.proof} />
              </div>
            ))}
            {!recent.length && (
              <p className="deck-empty">
                Your audit trail begins when the first operational record is
                saved.
              </p>
            )}
          </div>
          <footer>
            Saved records carry no independent execution confirmation.
          </footer>
        </article>
      </div>
      <article className="deck-panel deck-company-panel">
        <header>
          <div>
            <span className="deck-eyebrow">CUSTOMER ESTATE</span>
            <h2>The companies behind the numbers</h2>
          </div>
          <button className="deck-button" onClick={() => onNavigate("TENANTS")}>
            All companies <span aria-hidden="true">→</span>
          </button>
        </header>
        <div className="deck-company-table">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Registered host</th>
                <th>Licence</th>
                <th>Reported usage</th>
                <th>Last sync</th>
                <th>
                  <span className="sr-only">Inspect</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {companies.slice(0, 6).map((company, i) => (
                <tr key={company.id}>
                  <td>
                    <button
                      className="deck-company-link"
                      onClick={() => onInspect(company)}
                    >
                      <span className="deck-company-avatar" data-tone={i % 3}>
                        {company.name
                          .split(" ")
                          .slice(0, 2)
                          .map((word) => word[0])
                          .join("")}
                      </span>
                      <span>
                        <strong>{company.name}</strong>
                        <small>
                          {company.id.length > 22
                            ? company.id.slice(0, 18) + "…"
                            : company.id}
                        </small>
                      </span>
                    </button>
                  </td>
                  <td>
                    {cloudNames[company.cloudProvider] || company.cloudProvider}
                  </td>
                  <td>
                    <span
                      className="deck-license"
                      data-active={company.status === "ACTIVE"}
                    >
                      <i />
                      {nice(company.status)}
                    </span>
                  </td>
                  <td>
                    <div className="deck-usage">
                      <span>
                        {number(company.docsPosted)}
                        <small> / {number(company.maxDocsPerMonth)}</small>
                      </span>
                      <meter
                        min={0}
                        max={Math.max(
                          1,
                          company.docsPosted,
                          company.maxDocsPerMonth,
                        )}
                        value={company.docsPosted}
                        aria-label={company.name + " reported document quota"}
                      />
                    </div>
                  </td>
                  <td>
                    {company.lastSyncAt
                      ? new Date(company.lastSyncAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })
                      : "Not received"}
                  </td>
                  <td>
                    <button
                      className="deck-inspect-button"
                      aria-label={"Inspect " + company.name}
                      onClick={() => onInspect(company)}
                    >
                      ↗
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!companies.length && (
            <div className="deck-empty">
              No registered companies yet. Open Companies to register your first
              installation.
            </div>
          )}
        </div>
      </article>
      <div className="deck-bottom">
        <span>○ Source: provider database · Refreshes every 30 seconds</span>
        <div>
          <button onClick={() => onNavigate("DATABASES")}>
            Storage console ↗
          </button>
          <button onClick={() => onNavigate("APIS")}>API telemetry ↗</button>
        </div>
      </div>
    </section>
  );
}
