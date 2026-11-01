import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import api from "../utils/api";
import HelpdeskTicketInspector from "./HelpdeskTicketInspector";
vi.mock("../utils/api", () => ({ default: { get: vi.fn(), post: vi.fn() } }));
const detail = {
  id: "ticket-1",
  subject: "Invoice issue",
  description: "Description of the problem",
  status: "RESOLVED",
  priority: "NORMAL",
  queue: "TRIAGE",
  assigneeId: null,
  version: 2,
  proof: "requested",
  canConfirm: true,
  confirmedAt: null,
  events: [
    {
      id: "event-1",
      version: 2,
      kind: "RESOLVED",
      visibility: "PUBLIC",
      actorUsername: "owner",
      createdAt: new Date().toISOString(),
      text: "Proposed fix has been applied",
    },
  ],
  integrity: { valid: true, complete: true, events: 2 },
};
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
      <HelpdeskTicketInspector
        id="ticket-1"
        username="alice"
        role="VIEWER"
        onClose={() => {}}
      />
    </QueryClientProvider>,
  );
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  vi.mocked(api.get).mockImplementation(async (url) => ({
    data: String(url).includes("/resources/") ? [] : detail,
  }));
});
afterEach(cleanup);
describe("Helpdesk conversation and evidence", () => {
  it("shows a resolution claim separately and requires an explicit requester confirmation", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: {} });
    mount();
    await screen.findByText("Resolution awaiting confirmation");
    expect(
      screen.queryByText("Requester confirmed fixed"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "This is fixed" }),
    ).toBeDisabled();
    fireEvent.change(screen.getByRole("textbox", { name: "Outcome details" }), {
      target: { value: "I tested and the invoice now saves" },
    });
    fireEvent.click(screen.getByRole("button", { name: "This is fixed" }));
    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        "/helpdesk/tickets/ticket-1/confirm-fixed",
        {
          outcome: "FIXED",
          reason: "I tested and the invoice now saves",
          version: 2,
        },
      ),
    );
    expect(screen.queryByLabelText("Reply visibility")).not.toBeInTheDocument();
  });
  it("preserves reply text and reuses its key after a failed request", async () => {
    vi.mocked(api.post)
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ data: { saved: true } });
    mount();
    await screen.findByText("Conversation and audit history");
    fireEvent.change(screen.getByRole("textbox", { name: "Reply text" }), {
      target: { value: "The invoice still reports an error" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Post public reply" }));
    await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Post public reply" }),
      ).not.toBeDisabled(),
    );
    expect(screen.getByRole("textbox", { name: "Reply text" })).toHaveValue(
      "The invoice still reports an error",
    );
    fireEvent.click(screen.getByRole("button", { name: "Post public reply" }));
    await waitFor(() => expect(api.post).toHaveBeenCalledTimes(2));
    expect(vi.mocked(api.post).mock.calls[0]).toEqual(
      vi.mocked(api.post).mock.calls[1],
    );
  });
  it("does not offer confirmation when local evidence is incomplete or invalid", async () => {
    vi.mocked(api.get).mockImplementation(async (url) => ({
      data: String(url).includes("/resources/")
        ? []
        : {
            ...detail,
            proof: "recorded",
            canConfirm: false,
            events: [],
            integrity: { valid: false, complete: false, events: 0 },
          },
    }));
    mount();
    await screen.findByText(
      "Ticket history is incomplete or failed its integrity check. No independent verification is claimed.",
    );
    expect(
      screen.queryByRole("button", { name: "This is fixed" }),
    ).not.toBeInTheDocument();
  });
});
