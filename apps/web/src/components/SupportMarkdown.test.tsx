import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import SupportMarkdown from "./SupportMarkdown";
afterEach(cleanup);
describe("Safe support Markdown", () => {
  it("renders useful Markdown without executing raw HTML or fetching remote images", () => {
    const { container } = render(
      <SupportMarkdown
        text={
          "**Important**\n\n<script>alert(1)</script>\n\n![tracking](https://outside.example/pixel.png)\n\n[unsafe](javascript:alert(1))\n\n[docs](https://example.com/docs)"
        }
      />,
    );
    expect(screen.getByText("Important").tagName).toBe("STRONG");
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector('a[href^="javascript:"]')).toBeNull();
    expect(screen.getByRole("link", { name: "docs" })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
  });
});
