import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Helpdesk from "../pages/Helpdesk";
import api from "../utils/api";
vi.mock("../utils/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));
vi.mock("../components/StaffAssistant", () => ({
  default: () => <div>Workflow assistant</div>,
}));
const ticket = {
  id: "ticket-one",
  subject: "Invoice error",
  description: "Create an invoice and observe the error",
  category: "BUG",
  priority: "NORMAL",
  status: "OPEN",
  createdBy: "alice",
  version: 1,
  updatedAt: new Date().toISOString(),
};
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  vi.mocked(api.get).mockResolvedValue({ data: [] });
});
afterEach(cleanup);
const mount = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
          },
        })
      }
    >
      <Helpdesk />
    </QueryClientProvider>,
  );
describe("Installation helpdesk", () => {
  it("submits to the backend and reuses its request key after a network failure", async () => {
    vi.mocked(api.post)
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ data: ticket });
    mount();
    await screen.findByText("No tickets yet");
    fireEvent.change(screen.getByRole("textbox", { name: /^Subject/ }), {
      target: { value: ticket.subject },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /^What happened/ }), {
      target: { value: ticket.description },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Save ticket to installation" }),
    );
    await screen.findByText(/Your text is preserved for retry/);
    expect(screen.getByRole("textbox", { name: /^Subject/ })).toHaveValue(
      ticket.subject,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Save ticket to installation" }),
    );
    await screen.findByText(/Ticket ticket-one saved to this installation/);
    expect(vi.mocked(api.post).mock.calls[0][1]).toEqual(
      vi.mocked(api.post).mock.calls[1][1],
    );
  });
  it("keeps old browser drafts for deliberate review instead of automatically sending them", async () => {
    localStorage.setItem(
      "evergreen_helpdesk_tickets",
      JSON.stringify([
        {
          id: "old",
          subject: "Old draft",
          description: "Review this saved browser issue",
        },
      ]),
    );
    mount();
    await screen.findByText("Previous browser drafts");
    expect(api.post).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Old draft" }));
    expect(screen.getByRole("textbox", { name: /^Subject/ })).toHaveValue(
      "Old draft",
    );
    expect(api.post).not.toHaveBeenCalled();
  });
  it("offers status updates only for an administrator and sends the record version", async () => {
    sessionStorage.setItem(
      "user",
      JSON.stringify({ username: "owner", role: "ADMIN" }),
    );
    vi.mocked(api.get).mockResolvedValue({ data: [ticket] });
    vi.mocked(api.patch).mockResolvedValue({ data: ticket });
    mount();
    fireEvent.click(
      await screen.findByRole("button", { name: "Update status" }),
    );
    fireEvent.change(screen.getByLabelText("Resolution or progress note"), {
      target: { value: "Investigating the issue" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save update" }));
    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith("/helpdesk/tickets/ticket-one", {
        status: "OPEN",
        resolution: "Investigating the issue",
        version: 1,
      }),
    );
  });
});
