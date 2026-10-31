import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import DatabaseWorkspace from "./DatabaseWorkspace";
expect.extend(matchers);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const snapshot = {
  engine: "SQLite",
  scope: "Provider database",
  companies: 3,
  records: 7,
  auditEvents: 11,
  tenantDatabaseAccess: false,
  integrity: "ok",
  journalMode: "wal",
  prismaVersion: "5.22.0",
  models: [
    {
      name: "Company",
      fields: [
        { name: "name", type: "String", required: true, relation: false },
      ],
    },
  ],
};
describe("Live provider database workspace", () => {
  it("shows actual diagnostics and schema without simulated maintenance", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify(snapshot))),
    );
    render(<DatabaseWorkspace apiBase="/admin-api" />);
    await screen.findByText("SQLite / Prisma 5.22.0");
    expect(screen.getByText("ok")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Company/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.queryByText(/Vacuum & Checkpoint/)).not.toBeInTheDocument();
  });
  it("recovers from a failed request through explicit retry", async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new Error("Connection unavailable"))
      .mockResolvedValueOnce(new Response(JSON.stringify(snapshot)));
    vi.stubGlobal("fetch", fetcher);
    render(<DatabaseWorkspace apiBase="/admin-api" />);
    await screen.findByRole("alert");
    fireEvent.click(
      screen.getByRole("button", { name: "Refresh diagnostics" }),
    );
    await screen.findByText("SQLite / Prisma 5.22.0");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
