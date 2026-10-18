import * as matchers from "@testing-library/jest-dom/matchers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import App from "./App";
import { DEMO_TENANTS } from "./control-data";

// jest-dom is hoisted to the root node_modules and vitest is installed under apps/admin-web, so the
// "@testing-library/jest-dom/vitest" entry cannot resolve "vitest"; register the matchers and types here.
expect.extend(matchers);
declare module "vitest" {
  interface Matchers<
    R extends void | Promise<void> = void | Promise<void>,
    T = unknown,
  > extends matchers.TestingLibraryMatchers<unknown, R> {}
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => ({
      ok: true,
      json: async () => (url.endsWith("/companies") ? DEMO_TENANTS : []),
    })),
  );
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value() {
      this.setAttribute("open", "");
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value() {
      this.removeAttribute("open");
    },
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

async function openApp() {
  render(<App />);
  await screen.findByRole("heading", { level: 1, name: "Operations overview" });
  return within(screen.getByRole("navigation", { name: "Provider modules" }));
}

describe("Provider admin workspace", () => {
  it("does not offer a made-up release when the registry is empty", async () => {
    const nav = await openApp();
    fireEvent.click(nav.getByRole("button", { name: /^Deployments/ }));
    fireEvent.click(screen.getByRole("button", { name: /Trigger New Deployment/ }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("button", { name: "Deploy release" })).toBeDisabled();
    expect(within(dialog).getByText("No published releases available")).toBeInTheDocument();
    expect(within(dialog).queryByText(/v1.2.4-lts/)).not.toBeInTheDocument();
  });

  it("submits one deployment request and keeps operator identity on the server", async () => {
    let complete!: (response: Response) => void;
    const pending = new Promise<Response>(resolve => { complete = resolve; });
    vi.mocked(fetch).mockImplementation(async input => {
      const url = String(input);
      if (url.endsWith('/cicd/deploy')) return pending;
      return { ok: true, json: async () => url.endsWith('/companies') ? DEMO_TENANTS : url.endsWith('/cicd/releases') ? [{ id: 'release-1', version: 'v1.0.0', name: 'Release fixture', targets: ['DOCKER'], artifacts: [], createdAt: '2026-10-19T00:00:00Z' }] : [] } as Response;
    });
    const nav = await openApp();
    fireEvent.click(nav.getByRole('button', { name: /^Deployments/ }));
    fireEvent.click(screen.getByRole('button', { name: /Trigger New Deployment/ }));
    const dialog = screen.getByRole('dialog');
    await waitFor(() => expect(within(dialog).getByLabelText('Release Package')).toHaveValue('v1.0.0'));
    const submit = within(dialog).getByRole('button', { name: 'Deploy release' });
    fireEvent.click(submit); fireEvent.click(submit);
    expect(within(dialog).getByRole('button', { name: 'Requesting deployment…' })).toBeDisabled();
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeDisabled();
    const calls = vi.mocked(fetch).mock.calls.filter(([url]) => String(url).endsWith('/cicd/deploy'));
    expect(calls).toHaveLength(1);
    const payload = JSON.parse(String(calls[0][1]?.body));
    expect(payload).toMatchObject({ strategy: 'MAINTENANCE', packageVersion: 'v1.0.0' });
    expect(payload.requestKey).toMatch(/^[a-f0-9-]{36}$/);
    expect(payload).not.toHaveProperty('triggeredBy');
    await act(async () => { complete({ ok: true, json: async () => ({ id: 'job-1', status: 'QUEUED' }) } as Response); });
    expect(await screen.findByText(/job-1 is queued/)).toBeInTheDocument();
  });

  it("prevents duplicate renewals and reports only the saved provider settings", async () => {
    let complete!: (response: Response) => void;
    const pending = new Promise<Response>((resolve) => { complete = resolve; });
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith("/license")) return pending;
      return { ok: true, json: async () => url.endsWith("/companies") ? DEMO_TENANTS : [] } as Response;
    });
    await openApp();
    fireEvent.click(await screen.findByRole("button", { name: /^⚡ Reactivate/ }));
    const dialog = screen.getByRole("dialog", { name: "Renew license" });
    fireEvent.change(within(dialog).getByLabelText(/Bank payment UTR/), { target: { value: " TEST-123 " } });
    fireEvent.change(within(dialog).getByLabelText("Renewal duration"), { target: { value: "30_DAYS" } });
    const save = within(dialog).getByRole("button", { name: "Save license renewal" });
    fireEvent.click(save);
    fireEvent.click(save);
    expect(save).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeDisabled();
    fireEvent(dialog, new Event("cancel", { bubbles: false, cancelable: true }));
    expect(dialog).toBeInTheDocument();
    const requests = vi.mocked(fetch).mock.calls.filter(([url]) => String(url).endsWith("/license"));
    expect(requests).toHaveLength(1);
    const payload = JSON.parse(String(requests[0][1]?.body));
    expect(payload).toMatchObject({ status: "ACTIVE", graceExpiresAt: null, details: "Operator renewal request; payment reference: TEST-123" });
    expect(Date.parse(payload.expiresAt) - Date.now()).toBeGreaterThan(29 * 86400000);
    await act(async () => { complete({ ok: true } as Response); });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByText(/Tenant synchronization is not yet confirmed/)).toBeInTheDocument();
  });

  it("keeps a failed renewal open with its inputs available for correction", async () => {
    vi.mocked(fetch).mockImplementation(async (input) => ({
      ok: !String(input).endsWith("/license"), status: 400,
      json: async () => String(input).endsWith("/companies") ? DEMO_TENANTS : [],
    } as Response));
    await openApp();
    fireEvent.click(await screen.findByRole("button", { name: /^⚡ Reactivate/ }));
    const dialog = screen.getByRole("dialog", { name: "Renew license" });
    fireEvent.change(within(dialog).getByLabelText(/Bank payment UTR/), { target: { value: "PAY-456" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save license renewal" }));
    expect(await screen.findByText(/Reactivation failed with HTTP 400/)).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Save license renewal" })).toBeEnabled();
    expect(within(dialog).getByLabelText(/Bank payment UTR/)).toHaveValue("PAY-456");
  });

  it("reports unavailable data without substituting demo mills", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 503 } as Response);
    await openApp();
    expect(await screen.findByText(/Mill data is unavailable/)).toBeInTheDocument();
    expect(screen.queryByText(DEMO_TENANTS[0].name)).not.toBeInTheDocument();
  });

  it("renders every module with one page heading and an active navigation item", async () => {
    const nav = await openApp();
    const pages = [
      ["Spinning mills", "Spinning mills"],
      ["Tasks", "Tasks"],
      ["Deployments", "Deployments"],
      ["Release registry", "Release registry"],
      ["Database studio", "Database studio"],
      ["Maintenance", "Maintenance & SLA"],
      ["Integrations", "Integrations"],
      ["API management", "API management"],
      ["Webhooks", "Webhooks"],
      ["Payments", "Payments & reconciliation"],
      ["Agreements", "Agreements"],
      ["AI studio", "AI studio"],
      ["ChatOps", "ChatOps"],
      ["Ops terminal", "Ops terminal"],
      ["Console logs", "Console logs"],
      ["Overview", "Operations overview"],
    ];
    for (const [link, heading] of pages) {
      const button = nav.getByRole("button", { name: new RegExp("^" + link) });
      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-current", "page");
      expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
      expect(
        screen.getByRole("heading", { level: 1, name: heading }),
      ).toBeInTheDocument();
    }
  });

  it("opens module navigation, filters its group and closes it after selection", async () => {
    const nav = await openApp();
    const menu = screen.getByRole("button", { name: "Modules" });
    fireEvent.click(menu);
    expect(menu).toHaveAttribute("aria-expanded", "true");
    fireEvent.change(screen.getByRole("combobox", { name: "Module group" }), {
      target: { value: "FINANCE" },
    });
    expect(nav.getAllByRole("button")).toHaveLength(2);
    fireEvent.click(nav.getByRole("button", { name: /^Agreements/ }));
    expect(menu).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.getByRole("heading", { level: 1, name: "Agreements" }),
    ).toBeInTheDocument();
  });

  it("shows an empty tenant search and restores records when filters are cleared", async () => {
    const nav = await openApp();
    fireEvent.click(nav.getByRole("button", { name: /^Spinning mills/ }));
    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search spinning mills" }),
      { target: { value: "no-such-mill" } },
    );
    expect(
      screen.getByText("No mills match these filters."),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByText(DEMO_TENANTS[0].name)).toBeInTheDocument();
  });

  it("prints only provider API results in the ops terminal and never claims unrun operations", async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith("/health")) {
        return { ok: true, json: async () => ({ service: "evergreen-admin-api", status: "ok", timestamp: "2026-10-15T00:00:00.000Z", database: { status: "CONNECTED", tenantsManaged: 3 } }) } as Response;
      }
      return { ok: true, json: async () => url.endsWith("/companies") ? DEMO_TENANTS : [] } as Response;
    });
    const nav = await openApp();
    fireEvent.click(nav.getByRole("button", { name: /^Ops terminal/ }));
    const input = screen.getByRole("textbox", { name: "Terminal command" });
    const run = async (command: string) => {
      fireEvent.change(input, { target: { value: command } });
      await act(async () => { fireEvent.keyDown(input, { key: "Enter" }); });
    };

    await run("health");
    expect(await screen.findByText("Database: CONNECTED, 3 companies")).toBeInTheDocument();
    await run("backup");
    expect(await screen.findByText(/no backup endpoint, so no snapshot was taken/)).toBeInTheDocument();
    await run("weighbridge");
    expect(await screen.findByText(/No reading was taken/)).toBeInTheDocument();
    await run("rm -rf /");
    expect(await screen.findByText(/Unknown command "rm -rf \/". Nothing was run/)).toBeInTheDocument();
    expect(screen.queryByText(/successfully|100% operational|STREAM ACTIVE/)).not.toBeInTheDocument();
  });

  it("reports a failed provider API check instead of inventing a status", async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith("/health")) return { ok: false, status: 503, json: async () => ({}) } as Response;
      return { ok: true, json: async () => url.endsWith("/companies") ? DEMO_TENANTS : [] } as Response;
    });
    const nav = await openApp();
    fireEvent.click(nav.getByRole("button", { name: /^Ops terminal/ }));
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: /health$/ })); });
    expect(await screen.findByText(/Failed: the provider API did not answer \(HTTP 503\)/)).toBeInTheDocument();
  });

  it("opens a named dialog and handles native Escape cancellation without a mutation", async () => {
    await openApp();
    fireEvent.click(screen.getByRole("button", { name: /New Mill Tenant/ }));
    const dialog = screen.getByRole("dialog", {
      name: /Provision New Spinning Mill Tenant/,
    });
    expect(dialog).toHaveAttribute("open");
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent(
      dialog,
      new Event("cancel", { bubbles: false, cancelable: true }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(
      vi
        .mocked(fetch)
        .mock.calls.every(
          (call) => !call[1]?.method || call[1].method === "GET",
        ),
    ).toBe(true);
  });
});
