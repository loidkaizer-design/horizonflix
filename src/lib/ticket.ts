const KEY = "horizonflix_ticket";

export function getTicket(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function saveTicket(ticket: string) {
  try {
    window.localStorage.setItem(KEY, ticket);
  } catch {
    /* ignore */
  }
}

export function clearTicket() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export async function validateTicket(ticket: string): Promise<{ ok: boolean; message?: string }> {
  const clean = ticket.trim();
  if (!clean) return { ok: false, message: "Please enter a ticket code." };
  try {
    const res = await fetch(`https://tixy-ecru.vercel.app/api/ticket/${encodeURIComponent(clean)}`);
    let data: Record<string, unknown> = {};
    try {
      data = await res.json();
    } catch {
      /* non-json response */
    }
    const invalidFlag =
      data && (data["valid"] === false || data["success"] === false || data["error"]);
    if (!res.ok || invalidFlag) {
      const msg =
        (typeof data["message"] === "string" && data["message"]) ||
        (typeof data["error"] === "string" && data["error"]) ||
        "That ticket is not valid.";
      return { ok: false, message: msg };
    }
    return { ok: true };
  } catch {
    return { ok: false, message: "Couldn't reach the ticket service. Check your connection." };
  }
}
