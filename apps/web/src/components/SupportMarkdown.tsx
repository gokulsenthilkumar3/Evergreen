import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Box } from "@mui/material";
import { uiText } from "../i18n";
/** No raw HTML, embedded remote media, scripts or background link fetches. */
export default function SupportMarkdown({ text }: { text: string }) {
  return (
    <Box
      sx={{
        overflowWrap: "anywhere",
        "& p": { my: 1 },
        "& pre": {
          overflowX: "auto",
          p: 1.5,
          bgcolor: "action.hover",
          borderRadius: 1,
        },
        "& table": {
          borderCollapse: "collapse",
          display: "block",
          overflowX: "auto",
        },
        "& td,& th": { border: 1, borderColor: "divider", p: 1 },
        "& h1,& h2,& h3": { fontSize: "1.2rem" },
      }}
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          img: ({ alt }) => (
            <span>
              {uiText("Remote image preview is disabled.")}
              {alt ? " " + alt : ""}
            </span>
          ),
          a: ({ href, children }) => {
            let safe = false;
            try {
              safe =
                !!href &&
                ["http:", "https:"].includes(
                  new URL(href, window.location.origin).protocol,
                );
            } catch {}
            return safe ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
              >
                {children}
              </a>
            ) : (
              <span>{children}</span>
            );
          },
        }}
      >
        {text}
      </Markdown>
    </Box>
  );
}
