import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { createReadStream, statSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { extname, resolve, sep } from "node:path";

const demoCsp =
  "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
function serveDemo(directory: string) {
  const base = resolve(directory, "demo");
  return (
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void,
  ) => {
    const url = new URL(request.url || "/", "http://localhost");
    if (url.pathname === "/demo") {
      response.writeHead(308, { Location: "/demo/" + url.search });
      response.end();
      return;
    }
    if (!url.pathname.startsWith("/demo/")) {
      next();
      return;
    }
    const referenceTheme = /^\/demo\/Theme(?:Fiber|Platform|Textile|Original|RealTimeProfit)(?:\/|$)/.test(url.pathname);
    response.setHeader("Content-Security-Policy", referenceTheme ? "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data:; connect-src 'none'; frame-ancestors 'none'; object-src 'none'; base-uri 'none'; form-action 'none'" : (/^\/demo\/Theme(?:ThreadStory|GenesisAtelier)\//.test(url.pathname) ? demoCsp.replace("connect-src 'self'", "connect-src 'none'") : demoCsp));
    response.setHeader("X-Frame-Options", "DENY");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "no-referrer");
    response.setHeader("X-Robots-Tag", "noindex, nofollow");
    response.setHeader("Cache-Control", "no-store");
    if (!["GET", "HEAD"].includes(request.method || "")) {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end();
      return;
    }
    let file: string;
    try {
      file = resolve(
        base,
        decodeURIComponent(url.pathname.slice("/demo/".length)) || "index.html",
      );
      if (file !== base && !file.startsWith(base + sep)) {
        response.writeHead(403);
        response.end();
        return;
      }
      if (statSync(file).isDirectory()) file = resolve(file, "index.html");
      const info = statSync(file);
      if (!info.isFile()) throw new Error("Not a file");
      const types: Record<string, string> = {
        ".html": "text/html; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".svg": "image/svg+xml",
        ".md": "text/markdown; charset=utf-8",
        ".jsx": "application/octet-stream",
      };
      response.setHeader(
        "Content-Type",
        types[extname(file)] || "application/octet-stream",
      );
      response.setHeader("Content-Length", info.size);
      if (request.method === "HEAD") {
        response.end();
        return;
      }
      const stream = createReadStream(file);
      stream.on("error", () => response.destroy());
      stream.pipe(response);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Demo asset not found");
    }
  };
}
const demoHeaders: Plugin = {
  name: "evergreen-demo-review-headers",
  configureServer(server) {
    server.middlewares.use(serveDemo(server.config.publicDir));
  },
  configurePreviewServer(server) {
    server.middlewares.use(
      serveDemo(resolve(server.config.root, server.config.build.outDir)),
    );
  },
};

export default defineConfig({
  envPrefix: ["VITE_MARKETING_API_URL", "VITE_TENANT_PORTAL_URL"],
  plugins: [react(), demoHeaders],
  server: {
    port: 3300,
    proxy: {
      '/marketing-api/site-settings': { target: 'http://127.0.0.1:4300', changeOrigin: true, rewrite: () => '/public/marketing-settings' },
      "/marketing-api/ai/marketing": {
        target: "http://127.0.0.1:4301",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/marketing-api/, ""),
        configure(proxy) {
          proxy.on("proxyReq", (outgoing, request) => {
            outgoing.setHeader(
              "X-Forwarded-For",
              request.socket.remoteAddress || "unknown",
            );
          });
        },
      },
    },
  },
});
