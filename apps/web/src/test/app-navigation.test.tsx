import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import api from "../utils/api";

vi.mock("../utils/api", () => ({
  default: { get: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
vi.mock("../components/InstallationGate", () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("../pages/UnifiedWorkspace", () => ({
  default: () => <div>Workspace content</div>,
}));
vi.mock("../components/ProfileModal", () => ({ default: () => null }));
const clients: QueryClient[] = [];
let compact = false;

beforeEach(() => {
  compact = false;
  localStorage.clear();
  sessionStorage.clear();
  window.history.replaceState(null, "", "/workspace");
  vi.mocked(api.get).mockImplementation(async (url) => ({
    data: url === "/settings" ? { companyName: "Test Mill" } : [],
  }));
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("899.95") && compact,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
});
afterEach(() => {
  cleanup();
  clients.forEach((client) => client.clear());
  clients.length = 0;
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  localStorage.clear();
});

function mount(role = "ADMIN") {
  localStorage.setItem(
    "user",
    JSON.stringify({ username: "operator", name: "Mill operator", role }),
  );
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  clients.push(client);
  return render(
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>,
  );
}

describe("application navigation shell", () => {
  it("shows page context and remembers the desktop rail preference", async () => {
    mount();
    expect(await screen.findByText("Workspace content")).toBeVisible();
    expect(
      within(screen.getByRole("banner")).getByText("Business Workspace"),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Business Workspace" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("textbox", { name: "Search business records" }),
    ).toBeVisible();
    fireEvent.click(
      screen.getByRole("button", { name: "Collapse navigation" }),
    );
    await waitFor(() =>
      expect(localStorage.getItem("sidebarCollapsed")).toBe("true"),
    );
    expect(
      screen.queryByRole("textbox", { name: "Find a module" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Expand navigation" }));
    expect(
      screen.getByRole("textbox", { name: "Find a module" }),
    ).toBeVisible();
  });

  it("hides administrator modules and removes duplicate workspace aliases", async () => {
    mount("VIEWER");
    fireEvent.change(await screen.findByLabelText("Find a module"), {
      target: { value: "User Management" },
    });
    expect(
      screen.queryByRole("link", { name: "User Management" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("No matching modules");
    fireEvent.click(
      screen.getByRole("button", { name: "Clear module filter" }),
    );
    expect(
      screen.getAllByRole("link", { name: "Business Workspace" }),
    ).toHaveLength(1);
    expect(
      screen.queryByRole("link", { name: "Yarn ERP Hub" }),
    ).not.toBeInTheDocument();
  });

  it("starts mobile navigation closed and puts secondary actions in the account menu", async () => {
    compact = true;
    mount();
    expect(
      await screen.findByRole("button", { name: "Open navigation" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("navigation", { name: "Main navigation" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(
      await screen.findByRole("navigation", { name: "Main navigation" }),
    ).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Close navigation" }));
    await waitFor(() =>
      expect(
        screen.queryByRole("navigation", { name: "Main navigation" }),
      ).not.toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Account menu" }));
    expect(
      await screen.findByRole("menuitem", { name: "Refresh all data" }),
    ).toBeVisible();
    expect(screen.getByRole("menuitem", { name: "Dark theme" })).toBeVisible();
    expect(
      screen.getByRole("menuitem", { name: "தமிழில் காண்க" }),
    ).toBeVisible();
  });
});
