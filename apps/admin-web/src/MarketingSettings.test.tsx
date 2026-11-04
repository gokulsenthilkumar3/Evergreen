import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import MarketingSettings from "./MarketingSettings";
expect.extend(matchers);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const contacts = {
  salesEmail: "sales@evergreen.com",
  marketingEmail: "marketing@evergreen.com",
  licensingEmail: "licensing@evergreen.com",
  supportEmail: "support@evergreen.com",
  opensAt: "09:00",
  closesAt: "18:00",
  version: 3,
};
it("loads contacts and publishes the current version with the owner session", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(new Response(JSON.stringify(contacts)))
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          ...contacts,
          salesEmail: "sales2@evergreen.com",
          version: 4,
        }),
      ),
    );
  vi.stubGlobal("fetch", fetcher);
  render(<MarketingSettings apiBase="/admin-api" />);
  const input = await screen.findByDisplayValue("sales@evergreen.com");
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Publish contact details" }),
    ).toBeEnabled(),
  );
  fireEvent.change(input, { target: { value: "sales2@evergreen.com" } });
  fireEvent.click(
    screen.getByRole("button", { name: "Publish contact details" }),
  );
  expect(
    await screen.findByText(/Contact details published/),
  ).toBeInTheDocument();
  expect(fetcher.mock.calls[1][1].credentials).toBe("same-origin");
  expect(JSON.parse(fetcher.mock.calls[1][1].body)).toEqual({
    ...contacts,
    salesEmail: "sales2@evergreen.com",
  });
});
it("blocks publishing after a failed initial read and retains input after a conflict", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(new Response("{}", { status: 401 }))
    .mockResolvedValueOnce(new Response(JSON.stringify(contacts)))
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          message: "Contact settings changed. Reload before saving.",
        }),
        { status: 409 },
      ),
    );
  vi.stubGlobal("fetch", fetcher);
  render(<MarketingSettings apiBase="/admin-api" />);
  await screen.findByRole("alert");
  expect(
    screen.getByRole("button", { name: "Publish contact details" }),
  ).toBeDisabled();
  fireEvent.click(
    screen.getByRole("button", { name: "Reload saved settings" }),
  );
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Publish contact details" }),
    ).toBeEnabled(),
  );
  fireEvent.change(screen.getByLabelText("Sales team email"), {
    target: { value: "unsaved@evergreen.com" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Publish contact details" }),
  );
  await screen.findByText(/Contact settings changed/);
  expect(screen.getByLabelText("Sales team email")).toHaveValue(
    "unsaved@evergreen.com",
  );
});
