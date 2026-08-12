import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const checkTicket = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ ticket: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const clean = data.ticket.trim();
    try {
      const res = await fetch(
        `https://tixy-ecru.vercel.app/api/ticket/${encodeURIComponent(clean)}`,
        { headers: { accept: "application/json" } },
      );
      let body: Record<string, unknown> = {};
      try {
        body = (await res.json()) as Record<string, unknown>;
      } catch {
        /* non-json */
      }
      const invalid =
        body["valid"] === false || body["success"] === false || Boolean(body["error"]);
      if (!res.ok || invalid) {
        const msg =
          (typeof body["message"] === "string" && body["message"]) ||
          (typeof body["error"] === "string" && body["error"]) ||
          "That ticket is not valid.";
        return { ok: false as const, message: msg };
      }
      return { ok: true as const };
    } catch {
      return { ok: false as const, message: "Couldn't reach the ticket service. Try again." };
    }
  });
