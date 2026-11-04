import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import ProfileModal from "../components/ProfileModal";
import LanguageSelector from "../components/LanguageSelector";
import { setUiLanguage } from '../i18n';
vi.mock("../utils/api", () => ({
  default: {
    get: vi.fn(async () => ({
      data: {
        name: "Test operator",
        email: "operator@example.test",
        role: "ADMIN",
      },
    })),
    put: vi.fn(),
  },
}));
const clients: QueryClient[] = [];
afterEach(() => {
  cleanup();
  setUiLanguage('en');
  clients.forEach((c) => c.clear());
  clients.length = 0;
});
describe("simplified preferences", () => {
  for (const language of ["en", "ta"] as const)
    it(
      "removes appearance and navigation controls in " + language,
      async () => {
        setUiLanguage(language);
        const client = new QueryClient({
          defaultOptions: { queries: { retry: false, gcTime: 0 } },
        });
        clients.push(client);
        render(
          <QueryClientProvider client={client}>
            <ProfileModal
              open
              onClose={() => {}}
              currentUser={{ name: "Test operator", role: "ADMIN" }}
              language={language}
              onToggleLanguage={() => {}}
            />
          </QueryClientProvider>,
        );
        fireEvent.click(
          await screen.findByRole("tab", { name: language === 'ta' ? 'விருப்பங்கள்' : 'Preferences' }),
        );
        expect(screen.queryByText("Theme Palette")).toBeNull();
        expect(screen.queryByText("Interface & Navigation")).toBeNull();
        expect(screen.queryByRole("switch")).toBeNull();
        expect(screen.getByText(language === 'ta' ? 'மொழி விருப்பம்' : 'Language Preference')).toBeTruthy();
        if (language === 'ta') expect(screen.getAllByRole('checkbox')).toHaveLength(17);
      },
    );
  it("exposes labelled language choices and ignores reselecting the active language", () => {
    const change = vi.fn();
    render(<LanguageSelector language="en" onChange={change} />);
    fireEvent.click(screen.getByRole("button", { name: "English" }));
    expect(change).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "தமிழ்" }));
    expect(change).toHaveBeenCalledWith("ta");
  });
});
