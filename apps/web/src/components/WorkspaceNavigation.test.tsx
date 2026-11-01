import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import WorkspaceNavigation from "./WorkspaceNavigation";

afterEach(cleanup);
const groups = [
  {
    label: "Overview",
    items: [{ text: "Dashboard", page: "dashboard", icon: <span>D</span> }],
  },
  {
    label: "Operations & Job Work",
    items: [
      { text: "Inventory", page: "inventory", icon: <span>I</span>, badge: 3 },
    ],
  },
  {
    label: "Admin",
    items: [{ text: "Settings", page: "settings", icon: <span>S</span> }],
  },
];
const props = {
  groups,
  currentPage: "dashboard",
  expanded: true,
  compact: false,
  companyName: "EverGreen",
  username: "Mill user",
  role: "ADMIN",
  labelFor: (text: string) => text,
  onNavigate: vi.fn(),
  onToggle: vi.fn(),
  onProfile: vi.fn(),
  onLogout: vi.fn(),
};

describe("workspace navigation", () => {
  it("filters across closed groups and offers recovery when nothing matches", () => {
    render(<WorkspaceNavigation {...props} />);
    expect(
      screen.queryByRole("link", { name: "Settings" }),
    ).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Find a module"), {
      target: { value: "settings" },
    });
    expect(screen.getByRole("link", { name: "Settings" })).toBeVisible();
    expect(
      screen.queryByRole("link", { name: "Inventory" }),
    ).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Find a module"), {
      target: { value: "no matching name" },
    });
    expect(screen.getByRole("status")).toHaveTextContent("No matching modules");
    fireEvent.click(
      screen.getByRole("button", { name: "Clear module filter" }),
    );
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeVisible();
  });

  it("uses real links, keeps modified clicks native and marks the current page", () => {
    const navigate = vi.fn();
    render(<WorkspaceNavigation {...props} onNavigate={navigate} />);
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Operations & Job Work" }),
    );
    const inventory = screen.getByRole("link", { name: "Inventory" });
    expect(inventory).toHaveAttribute("href", "/inventory");
    // Observe the native modifier behavior, then suppress jsdom's unsupported page navigation.
    let nativeClickWasPrevented = true;
    const observeNativeClick = (event: MouseEvent) => {
      nativeClickWasPrevented = event.defaultPrevented;
      event.preventDefault();
    };
    document.addEventListener("click", observeNativeClick, { once: true });
    fireEvent.click(inventory, { ctrlKey: true });
    expect(nativeClickWasPrevented).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
    fireEvent.click(inventory);
    expect(navigate).toHaveBeenCalledWith("inventory");
    expect(screen.getByLabelText("3 low-stock counts")).toBeVisible();
  });

  it("opens the active group when the page changes and allows collapsing it", async () => {
    const view = render(<WorkspaceNavigation {...props} />);
    view.rerender(<WorkspaceNavigation {...props} currentPage="settings" />);
    expect(screen.getByRole("button", { name: "Admin" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    fireEvent.click(screen.getByRole("button", { name: "Admin" }));
    expect(screen.getByRole("button", { name: "Admin" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("link", { name: "Settings" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("keeps all permitted destinations accessible in the collapsed rail", () => {
    render(<WorkspaceNavigation {...props} expanded={false} />);
    expect(screen.queryByLabelText("Find a module")).not.toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(3);
    fireEvent.click(screen.getByRole("button", { name: "Expand navigation" }));
    expect(props.onToggle).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "My profile" }));
    expect(props.onProfile).toHaveBeenCalled();
  });

  it("provides explicit close and sign-out controls on mobile", () => {
    const close = vi.fn(),
      logout = vi.fn();
    render(
      <WorkspaceNavigation
        {...props}
        compact
        onToggle={close}
        onLogout={logout}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Close navigation" }));
    expect(close).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    expect(logout).toHaveBeenCalled();
  });
});
