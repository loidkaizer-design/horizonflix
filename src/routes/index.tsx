import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Ticket,
  Loader2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Monitor,
} from "lucide-react";

import { Logo } from "@/components/Logo";
import { Attribution } from "@/components/Navigation";
import { getTicket, saveTicket, validateTicket } from "@/lib/ticket";
import { isMobileDevice } from "@/lib/device";

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
  const [checking, setChecking] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    if (getTicket()) navigate({ to: "/home" });
    setMobile(isMobileDevice());
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

  async function onContinue() {
    setChecking(true);
    setError(null);
    const res = await validateTicket(ticket);
    setChecking(false);
    if (!res.ok) {
      setVerified(false);
      setError(res.message ?? "This ticket is no longer active.");
      return;
    }
    saveTicket(ticket.trim());
    navigate({ to: "/home" });
  }

  if (verified) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
        <div className="animate-float absolute -top-40 -left-32 h-[26rem] w-[26rem] rounded-full bg-primary/25 blur-[120px]" />
        <div className="animate-pulse-glow absolute -right-24 -bottom-32 h-[24rem] w-[24rem] rounded-full bg-accent/20 blur-[130px]" />

        <div className="animate-rise glass relative w-full max-w-md rounded-3xl p-8 text-center shadow-[var(--shadow-card)]">
          <div className="flex flex-col items-center">
            <Logo className="h-20" />
            <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              <CheckCircle2 className="h-3.5 w-3.5" /> Ticket valid
            </p>
          </div>

          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-muted-foreground">
            {mobile ? <Smartphone className="h-3.5 w-3.5" /> : <Monitor className="h-3.5 w-3.5" />}
            {mobile ? "Mobile device detected" : "Desktop device detected"}
          </p>

          <h1 className="mt-4 text-xl font-bold">Verify your device</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mobile
              ? "Set up uBlock DNS on your phone to block ads during playback. Finish the setup, follow the instructions, then come back here."
              : "Install the Luna AdBlock extension for your browser. Finish the setup, follow the instructions, then come back here."}
          </p>

          <a
            href={
              mobile
                ? "https://ublockdns.com/"
                : "https://chromewebstore.google.com/detail/luna-adblock-for-youtube/ehfcoplbhoohillcmlophcfghpeilfjc"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="gradient-violet group mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110"
          >
            <ShieldCheck className="h-4 w-4" />
            {mobile ? "Open uBlock DNS" : "Get Luna AdBlock"}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>

          <button
            onClick={onContinue}
            disabled={checking}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm text-muted-foreground transition-all duration-300 hover:border-accent hover:text-accent disabled:opacity-60"
          >
            {checking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Testing…
              </>
            ) : (
              "Done"
            )}
          </button>
        </div>
        <Attribution />
      </main>
    );
  }


  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
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
      <Attribution />
    </main>
  );
}
