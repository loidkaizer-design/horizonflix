import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

function isBearerToken(token: string) {
  return token.startsWith("eyJ") || token.includes(".");
}

function getTmdbTokens(env: unknown) {
  const runtimeEnv = env as Record<string, unknown> | undefined;
  return [
    runtimeEnv?.TMDB_API_TOKEN,
    runtimeEnv?.TMDB_API_TOKEN_FALLBACK,
    process.env.TMDB_API_TOKEN,
    process.env.TMDB_API_TOKEN_FALLBACK,
  ].filter(
    (value, index, values): value is string =>
      typeof value === "string" && Boolean(value.trim()) && values.indexOf(value) === index,
  );
}

async function handleTmdbProxy(request: Request, env: unknown): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/tmdb/")) return null;

  const suffix = url.pathname.replace(/^\/api\/tmdb/, "");
  const target = new URL(`https://api.themoviedb.org/3${suffix}`);
  target.search = url.search;
  const tokens = getTmdbTokens(env);
  if (!tokens.length) {
    return Response.json({ error: "TMDB is not configured" }, { status: 503 });
  }

  for (const token of tokens) {
    const headers = new Headers({ accept: "application/json" });
    if (isBearerToken(token)) headers.set("Authorization", `Bearer ${token}`);
    else target.searchParams.set("api_key", token);
    try {
      const response = await fetch(target, { headers, signal: AbortSignal.timeout(10000) });
      if (response.ok || ![401, 403].includes(response.status)) {
        return new Response(response.body, {
          status: response.status,
          headers: {
            "content-type": "application/json",
            "cache-control": "public, max-age=300, s-maxage=900, stale-while-revalidate=3600",
          },
        });
      }
    } catch (error) {
      console.error("[tmdb] production proxy request failed", error);
    }
  }
  return Response.json({ error: "TMDB is temporarily unavailable" }, { status: 503 });
}

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const tmdbResponse = await handleTmdbProxy(request, env);
      if (tmdbResponse) return tmdbResponse;
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
