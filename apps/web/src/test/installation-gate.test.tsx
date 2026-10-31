import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, it, expect, vi } from "vitest";
import InstallationGate from "../components/InstallationGate";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("keeps business content unmounted until a licence is verified", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ active: true }) }),
  );
  render(
    <InstallationGate url="/license/status">
      <p>Private workspace</p>
    </InstallationGate>,
  );
  expect(screen.queryByText("Private workspace")).not.toBeInTheDocument();
  expect(await screen.findByText("Private workspace")).toBeInTheDocument();
});
it("shows an activation gate for missing access and recovers after activation", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ active: false }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ active: true }) });
  vi.stubGlobal("fetch", fetcher);
  render(
    <InstallationGate url="/license/status">
      <p>Private workspace</p>
    </InstallationGate>,
  );
  expect(
    await screen.findByText("Installation authorization required"),
  ).toBeInTheDocument();
  expect(screen.queryByText("Private workspace")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Check again" }));
  await waitFor(() =>
    expect(screen.getByText("Private workspace")).toBeInTheDocument(),
  );
});
