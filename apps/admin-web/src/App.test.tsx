import * as matchers from "@testing-library/jest-dom/matchers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
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
