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
  let tokens: string[] = [];
  const handler: Connect.NextHandleFunction = async (req, res, next) => {
    if (!req.url?.startsWith("/api/tmdb")) return next();
    if (!tokens.length) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: "TMDB is not configured" }));
      return;
    }
    const target = new URL(`https://api.themoviedb.org/3${req.url.replace(/^\/api\/tmdb/, "")}`);
    try {
      let upstream: Response | undefined;
      for (const token of tokens) {
        const requestUrl = new URL(target);
        const headers: Record<string, string> = isV4BearerToken(token)
          ? { Authorization: `Bearer ${token}`, accept: "application/json" }
          : { accept: "application/json" };
        if (!isV4BearerToken(token)) requestUrl.searchParams.set("api_key", token);
        upstream = await fetch(requestUrl, { headers, signal: AbortSignal.timeout(12000) });
        if (upstream.ok || ![401, 403].includes(upstream.status)) break;
      }
      if (!upstream) throw new Error("No TMDB token configured");
      res.statusCode = upstream.status;
      res.setHeader("content-type", "application/json");
      res.setHeader("cache-control", "public, max-age=300, stale-while-revalidate=3600");
      res.end(await upstream.text());
    } catch (error) {
      console.error("[tmdb-proxy] upstream unavailable", error);
      res.statusCode = 504;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ error: "TMDB temporarily unavailable" }));
    }
  };
  return {
    name: "tmdb-server-proxy",
    config(_, env) {
      const envValues = loadEnv(env.mode, process.cwd(), "");
      tokens = [
        envValues.TMDB_API_TOKEN || process.env.TMDB_API_TOKEN,
        envValues.TMDB_API_TOKEN_FALLBACK || process.env.TMDB_API_TOKEN_FALLBACK,
      ].filter((value): value is string => Boolean(value?.trim()));
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
