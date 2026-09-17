// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv, type Connect, type Plugin } from "vite";

/**
 * Detect whether a TMDB token is a v3 API key (32-char hex) or a v4 Bearer JWT
 * (eyJ...). v3 keys must be sent as `?api_key=`, v4 tokens must be sent as
 * `Authorization: Bearer`. Sending a v3 key as Bearer returns HTTP 401.
 */
function isV4BearerToken(token: string): boolean {
  return token.startsWith("eyJ") || token.includes(".");
}

function tmdbProxy(): Plugin {
  let token = "";
  const handler: Connect.NextHandleFunction = async (req, res, next) => {
    if (!req.url?.startsWith("/api/tmdb")) return next();
    if (!token) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: "TMDB is not configured" }));
      return;
    }
    const target = new URL(`https://api.themoviedb.org/3${req.url.replace(/^\/api\/tmdb/, "")}`);
    // v3 keys need api_key query param; v4 tokens need Bearer header
    if (!isV4BearerToken(token)) {
      target.searchParams.set("api_key", token);
    }
    const headers: Record<string, string> = isV4BearerToken(token)
      ? { Authorization: `Bearer ${token}`, accept: "application/json" }
      : { accept: "application/json" };
    const upstream = await fetch(target, { headers });
    res.statusCode = upstream.status;
    res.setHeader("content-type", "application/json");
    res.end(await upstream.text());
  };
  return {
    name: "tmdb-server-proxy",
    config(_, env) {
      const envValues = loadEnv(env.mode, process.cwd(), "");
      token = envValues.TMDB_API_TOKEN || process.env.TMDB_API_TOKEN || "";
    },
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig({
  vite: { plugins: [tmdbProxy()] },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
