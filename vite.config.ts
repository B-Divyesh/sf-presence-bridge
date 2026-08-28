import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";
import { resolve } from "node:path";

const packageVersion = (JSON.parse(readFileSync(resolve(__dirname, "package.json"), "utf8")) as { version: string }).version;
const revision = process.env.GITHUB_SHA?.slice(0, 12) || execFileSync("git", ["rev-parse", "--short=12", "HEAD"], { encoding: "utf8" }).trim();
const buildId = `${packageVersion}-${revision}`;
const documentRoutes = new Set(["/", "/demo", "/privacy", "/terms", "/download", "/app.html", "/404.html"]);

function realNotFound(): Plugin {
  const isMissingDocument = (request: { method?: string; url?: string; headers: { accept?: string } }) => {
    const path = new URL(request.url || "/", "http://local").pathname;
    return request.method === "GET" && request.headers.accept?.includes("text/html") && !documentRoutes.has(path) && !path.includes(".");
  };
  return {
    name: "presence-bridge-real-404",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (!isMissingDocument(request)) return next();
        try {
          const source = readFileSync(resolve(__dirname, "404.html"), "utf8");
          const html = await server.transformIndexHtml(request.url || "/404.html", source);
          response.statusCode = 404;
          response.setHeader("Content-Type", "text/html; charset=utf-8");
          response.end(html);
        } catch (error) { next(error as Error); }
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((request, response, next) => {
        if (!isMissingDocument(request)) return next();
        response.statusCode = 404;
        response.setHeader("Content-Type", "text/html; charset=utf-8");
        response.end(readFileSync(resolve(__dirname, "dist/site/404.html"), "utf8"));
      });
    }
  };
}

export default defineConfig({
  plugins: [realNotFound()],
  define: { __BUILD_ID__: JSON.stringify(buildId) },
  build: {
    outDir: "dist/site",
    emptyOutDir: true,
    target: "es2022",
    manifest: "asset-manifest.json",
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        app: resolve(__dirname, "app.html"),
        "404": resolve(__dirname, "404.html")
      }
    }
  },
  server: { port: 4173, strictPort: true }
});
