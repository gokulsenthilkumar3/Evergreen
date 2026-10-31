import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import Login from "../components/Login";
import api from "../utils/api";
import { clearAuth, getToken, saveSession } from "../utils/authStorage";
vi.mock("../utils/api", () => ({ default: { post: vi.fn() } }));
vi.mock("@simplewebauthn/browser", () => ({ startAuthentication: vi.fn() }));
beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});
afterEach(cleanup);
const enter = () => {
  fireEvent.change(screen.getByLabelText(/Username/), {
    target: { value: " staff " },
  });
  fireEvent.change(screen.getByLabelText(/^Password/), {
    target: { value: "secret" },
  });
};
it("stores shared-device login in the tab and continues immediately", async () => {
  const success = vi.fn();
  vi.mocked(api.post).mockResolvedValue({
    data: { access_token: "session-token", user: { username: "staff" } },
  });
  render(<Login onLoginSuccess={success} />);
  enter();
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
  await waitFor(() => expect(success).toHaveBeenCalledOnce());
  expect(sessionStorage.getItem("token")).toBe("session-token");
  expect(localStorage.getItem("token")).toBeNull();
  expect(api.post).toHaveBeenCalledWith("/auth/login", {
    username: "staff",
    password: "secret",
  });
});
it("persists login only when requested", async () => {
  vi.mocked(api.post).mockResolvedValue({
    data: { access_token: "saved-token", user: { username: "staff" } },
  });
  render(<Login onLoginSuccess={vi.fn()} />);
  enter();
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
  await waitFor(() =>
    expect(localStorage.getItem("token")).toBe("saved-token"),
  );
  expect(sessionStorage.getItem("token")).toBeNull();
});
it("continues through MFA without losing the username and password", async () => {
  const success = vi.fn();
  vi.mocked(api.post)
    .mockRejectedValueOnce({ response: { data: { message: "TOTP_REQUIRED" } } })
    .mockResolvedValueOnce({
      data: { access_token: "mfa-token", user: { username: "staff" } },
    });
  render(<Login onLoginSuccess={success} />);
  enter();
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
  const code = await screen.findByLabelText(/Authenticator code/);
  fireEvent.change(code, { target: { value: "123456" } });
  fireEvent.click(screen.getByRole("button", { name: "Verify and sign in" }));
  await waitFor(() => expect(success).toHaveBeenCalledOnce());
  expect(api.post).toHaveBeenLastCalledWith("/auth/login", {
    username: "staff",
    password: "secret",
    totpCode: "123456",
  });
});
it("shows network recovery and actionable account help", async () => {
  vi.mocked(api.post).mockRejectedValue(new Error("Network error"));
  render(<Login onLoginSuccess={vi.fn()} />);
  enter();
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
  expect(await screen.findByText(/Check your connection/)).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "Need help signing in?" }),
  );
  expect(
    await screen.findByText(/Contact your company administrator/),
  ).toBeInTheDocument();
});
it("switches storage modes without keeping old credentials and clears both on logout", () => {
  saveSession("old", {}, true);
  saveSession("new", {}, false);
  expect(getToken()).toBe("new");
  expect(localStorage.getItem("token")).toBeNull();
  clearAuth();
  expect(getToken()).toBeNull();
});
