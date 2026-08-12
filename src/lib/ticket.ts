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
    const { checkTicket } = await import("./ticket.functions");
    return await checkTicket({ data: { ticket: clean } });
  } catch {
    return { ok: false, message: "Couldn't reach the ticket service. Check your connection." };
  }
}

