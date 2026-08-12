import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Ticket, Loader2, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

import { Logo } from "@/components/Logo";
import { getTicket, saveTicket, validateTicket } from "@/lib/ticket";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HorizonFlix — Enter Your Access Ticket" },
      {
        name: "description",
        content:
          "Validate your HorizonFlix access ticket to unlock unlimited streaming of trending movies.",
      },
      { property: "og:title", content: "HorizonFlix — Enter Your Access Ticket" },
      {
        property: "og:description",
        content: "Ticket-based access to a premium movie streaming experience.",
      },
    ],
  }),
  component: TicketPage,
});

function TicketPage() {
  const navigate = useNavigate();
  const [ticket, setTicket] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (getTicket()) navigate({ to: "/home" });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await validateTicket(ticket);
    setLoading(false);
    if (res.ok) {
      setVerified(true);
    } else {
      setError(res.message ?? "Invalid ticket.");
    }
  }

  function onContinue() {
    saveTicket(ticket.trim());
    navigate({ to: "/home" });
  }

  if (verified) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
        <div className="animate-float absolute -top-40 -left-32 h-[26rem] w-[26rem] rounded-full bg-primary/25 blur-[120px]" />
        <div className="animate-pulse-glow absolute -right-24 -bottom-32 h-[24rem] w-[24rem] rounded-full bg-accent/20 blur-[130px]" />

        <div className="animate-rise glass relative w-full max-w-md rounded-3xl p-8 text-center shadow-[var(--shadow-card)]">
          <div className="flex flex-col items-center">
            <Logo className="h-20" />
            <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              <CheckCircle2 className="h-3.5 w-3.5" /> Ticket valid
            </p>
          </div>

          <h1 className="mt-6 text-xl font-bold">Please process and validate your browser</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            To keep playback smooth and ad-free, install and enable an ad blocker before you
            continue.
          </p>

          <a
            href="https://app.adblockluna.com/en"
            target="_blank"
            rel="noopener noreferrer"
            className="gradient-violet group mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110"
          >
            <ShieldCheck className="h-4 w-4" />
            Luna AdBlocker
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>

          <button
            onClick={onContinue}
            className="mt-3 w-full rounded-xl border border-border py-3 text-sm text-muted-foreground transition-all duration-300 hover:border-accent hover:text-accent"
          >
            Continue to HorizonFlix
          </button>
        </div>
      </main>
    );
  }


  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="animate-float absolute -top-40 -left-32 h-[26rem] w-[26rem] rounded-full bg-primary/25 blur-[120px]" />
      <div className="animate-pulse-glow absolute -right-24 -bottom-32 h-[24rem] w-[24rem] rounded-full bg-accent/20 blur-[130px]" />

      <div className="animate-rise glass relative w-full max-w-md rounded-3xl p-8 shadow-[var(--shadow-card)]">
        <div className="flex flex-col items-center text-center">
          <Logo className="h-24" />
          <p className="mt-1 text-xs tracking-[0.35em] text-muted-foreground uppercase">
            Powered by Fantomistic
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block text-sm font-semibold" htmlFor="ticket">
            Enter your access ticket
          </label>
          <div className="group relative">
            <Ticket className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent" />
            <input
              id="ticket"
              value={ticket}
              onChange={(e) => setTicket(e.target.value)}
              placeholder="e.g. HZX-2026-XXXX"
              autoComplete="off"
              className="w-full rounded-xl border border-border bg-secondary/60 py-3.5 pr-4 pl-12 tracking-wider outline-none transition-all duration-300 focus:border-accent focus:bg-secondary focus:ring-2 focus:ring-ring/40"
            />
          </div>

          {error && (
            <p className="animate-rise rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="gradient-violet group flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Validating…
              </>
            ) : (
              <>
                Validate ticket
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Your ticket keeps you signed in on this device.
        </p>
      </div>
    </main>
  );
}
