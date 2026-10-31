import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Integrations from "../pages/Integrations";
import api from "../utils/api";
vi.mock("../utils/api", () => ({ default: { get: vi.fn(), post: vi.fn() } }));
let client: QueryClient;
beforeEach(() => {
  vi.resetAllMocks();
  client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
});
afterEach(() => {
  cleanup();
  client.clear();
});
const mount = () =>
  render(
    <QueryClientProvider client={client}>
      <Integrations />
    </QueryClientProvider>,
  );
const upload = () => {
  const file = new File(["name,phone\nBuyer,9876543210"], "customers.csv", {
    type: "text/csv",
  });
  Object.defineProperty(file, "text", {
    value: async () => "name,phone\nBuyer,9876543210",
  });
  fireEvent.change(screen.getByLabelText("Choose CSV file"), {
    target: { files: [file] },
  });
};
it("maps a template, previews, and retries a failed commit with the same key", async () => {
  let commits = 0;
  vi.mocked(api.post).mockImplementation(async (path) => {
    if (path === "/integrations/imports/preview")
      return {
        data: {
          records: [{ name: "Buyer", phone: "9876543210" }],
          issues: [],
          ignoredHeaders: [],
        },
      };
    if (++commits === 1) throw new Error("Connection interrupted");
    return { data: { rowCount: 1, id: 4 } };
  });
  mount();
  fireEvent.change(screen.getByLabelText(/Source name/), {
    target: { value: "Old register" },
  });
  upload();
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Validate and preview" }),
    ).toBeEnabled(),
  );
  fireEvent.click(screen.getByRole("button", { name: "Validate and preview" }));
  expect(
    await screen.findByText("1 records checked - 0 issues to resolve"),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: "Import 1 records" }));
  expect(await screen.findByText("Connection interrupted")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Import 1 records" }));
  expect(await screen.findByText(/Import complete/)).toBeInTheDocument();
  const calls = vi
    .mocked(api.post)
    .mock.calls.filter((call) => call[0] === "/integrations/imports/commit");
  expect((calls[0][1] as { requestKey: string }).requestKey).toBe(
    (calls[1][1] as { requestKey: string }).requestKey,
  );
  expect(
    screen.queryByRole("button", { name: "Import 1 records" }),
  ).not.toBeInTheDocument();
});
it("blocks commit for duplicate preview records", async () => {
  vi.mocked(api.post).mockResolvedValue({
    data: {
      records: [{ name: "Buyer" }],
      issues: [{ row: 2, field: "name", message: "Customer already exists" }],
      ignoredHeaders: [],
    },
  });
  mount();
  upload();
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Validate and preview" }),
    ).toBeEnabled(),
  );
  fireEvent.click(screen.getByRole("button", { name: "Validate and preview" }));
  expect(
    await screen.findByText(/Customer already exists/),
  ).toBeInTheDocument();
  expect(screen.getByRole("checkbox")).toBeDisabled();
  expect(
    screen.getByRole("button", { name: "Import 1 records" }),
  ).toBeDisabled();
});
it("requires a fresh preview when export selection changes", async () => {
  vi.mocked(api.get).mockResolvedValue({
    data: { stats: { totalVouchers: 2, salesCount: 2, receiptCount: 0 } },
  });
  mount();
  fireEvent.click(screen.getByRole("tab", { name: "TallyPrime" }));
  expect(
    screen.getByRole("button", { name: "Download Tally XML" }),
  ).toBeDisabled();
  fireEvent.click(screen.getByLabelText("Receipts & reversals"));
  fireEvent.click(
    screen.getByRole("button", { name: "Preview voucher counts" }),
  );
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Download Tally XML" }),
    ).toBeEnabled(),
  );
  expect(api.get).toHaveBeenCalledWith("/integrations/tally/summary", {
    params: { from: undefined, to: undefined, types: "Sales" },
  });
  fireEvent.change(screen.getByLabelText("From"), {
    target: { value: "2026-10-01" },
  });
  expect(
    screen.getByRole("button", { name: "Download Tally XML" }),
  ).toBeDisabled();
});
it("offers a recoverable history failure", async () => {
  vi.mocked(api.get).mockRejectedValue(new Error("Offline"));
  mount();
  fireEvent.click(screen.getByRole("tab", { name: "Import history" }));
  expect(
    await screen.findByText("Import history could not be loaded."),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Retry" })).toBeEnabled();
});
