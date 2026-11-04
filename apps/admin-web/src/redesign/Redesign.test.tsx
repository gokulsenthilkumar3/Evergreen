import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import ProofLedger from "./ProofLedger";
import DataExplorer from "./DataExplorer";
expect.extend(matchers);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("evidence workspace", () => {
  it("filters server proof events and opens their inspector data", async () => {
    const events = [
      {
        id: "audit:1",
        entityId: "record-1",
        entityType: "PAYMENT",
        title: "Bank transfer claim",
        actor: "Owner",
        action: "CREATED",
        proof: {
          state: "recorded",
          reason: "Saved only",
          source: "provider.database",
          at: "2026-11-01T00:00:00Z",
        },
        at: "2026-11-01T00:00:00Z",
      },
      {
        id: "job:1",
        entityId: "job-1",
        entityType: "DEPLOYMENT",
        title: "Mill upgrade",
        actor: "Owner",
        action: "SUCCEEDED",
        proof: {
          state: "executed",
          reason: "Workflow completed",
          source: "provider.release-job",
          at: "2026-11-01T00:00:00Z",
        },
        at: "2026-11-01T00:00:00Z",
      },
    ];
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({
          ok: true,
          json: async () => ({ events, coverage: "Recorded audit events" }),
        }),
    );
    const inspect = vi.fn();
    render(<ProofLedger apiBase="/admin-api" onInspect={inspect} />);
    await screen.findByText("Bank transfer claim");
    fireEvent.change(screen.getByLabelText("Proof state"), {
      target: { value: "executed" },
    });
    expect(screen.queryByText("Bank transfer claim")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Mill upgrade/ }));
    expect(inspect).toHaveBeenCalledWith(
      expect.objectContaining({
        entityId: "job-1",
        proof: expect.objectContaining({ state: "executed" }),
      }),
    );
    expect(screen.queryByText("Confirmed")).not.toBeInTheDocument();
  });
  it("does not read database rows until the owner explicitly requests an audited read", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          rows: [{ id: "company-1", name: "Owner mill" }],
          total: 1,
          pageSize: 50,
          scope: "Approved fields",
        }),
      });
    vi.stubGlobal("fetch", fetcher);
    render(<DataExplorer apiBase="/admin-api" />);
    expect(fetcher).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Read table" })).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Read table" }));
    await screen.findByText("Owner mill");
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({
      table: "Company",
      page: 0,
    });
  });
});
