import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AiAssistant from "../../../../packages/portal-ui/AiAssistant";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const props = {
  endpoint: "/test/ai/staff",
  title: "Loom",
  purpose: "Workflow help",
  prompts: ["Explain Tally export"],
};
describe("Portal AI conversation boundaries", () => {
  it("does not submit without consent and sends only the chosen question", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ configured: true })))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ answer: "Review the XML before importing." }),
        ),
      );
    vi.stubGlobal("fetch", fetcher);
    render(
      <AiAssistant {...props} authorization={() => "Bearer test-token"} />,
    );
    await screen.findByText("Ready - guidance only");
    fireEvent.click(
      screen.getByRole("button", { name: "Explain Tally export" }),
    );
    expect(
      screen.getByRole("button", { name: "Send question" }),
    ).toBeDisabled();
    expect(fetcher).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Send question" }));
    await screen.findByText("Review the XML before importing.");
    expect(JSON.parse(fetcher.mock.calls[1][1].body)).toEqual({
      message: "Explain Tally export",
      history: [],
    });
    expect(fetcher.mock.calls[1][1].headers.Authorization).toBe(
      "Bearer test-token",
    );
    fireEvent.click(screen.getByRole("button", { name: "Clear conversation" }));
    expect(
      screen.queryByText("Review the XML before importing."),
    ).not.toBeInTheDocument();
  });
  it("shows missing configuration and never substitutes a fabricated answer", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ configured: false })));
    vi.stubGlobal("fetch", fetcher);
    render(<AiAssistant {...props} />);
    await screen.findByText(/Setup needed/);
    fireEvent.change(screen.getByLabelText("Your question"), {
      target: { value: "hello" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    expect(
      screen.getByRole("button", { name: "Send question" }),
    ).toBeDisabled();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("preserves a failed question and renders provider output as text", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ configured: true })))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ message: "Please wait before retrying." }),
          { status: 429 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ answer: "<img src=x onerror=alert(1)>" }),
        ),
      );
    vi.stubGlobal("fetch", fetcher);
    const { container } = render(<AiAssistant {...props} />);
    await screen.findByText("Ready - guidance only");
    fireEvent.change(screen.getByLabelText("Your question"), {
      target: { value: "Explain this workflow" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Send question" }));
    await screen.findByRole("alert");
    expect(screen.getByLabelText("Your question")).toHaveValue(
      "Explain this workflow",
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Send question" }),
      ).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Send question" }));
    await screen.findByText("<img src=x onerror=alert(1)>");
    expect(container.querySelector("img")).toBeNull();
  });
});
