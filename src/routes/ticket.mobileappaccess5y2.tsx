import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldAlert, Smartphone } from "lucide-react";

import { Logo } from "@/components/Logo";
import { saveTicket } from "@/lib/ticket";
import { isWebView } from "@/lib/device";

export const Route = createFileRoute("/ticket/mobileappaccess5y2")({
  head: () => ({
    meta: [
      { title: "HorizonFlix — App Access" },
      {
        name: "description",
        content: "Unlimited HorizonFlix access for the mobile app.",
      },
      { property: "og:title", content: "HorizonFlix — App Access" },
      { property: "og:description", content: "Unlimited HorizonFlix access for the mobile app." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AppAccessPage,
});

function AppAccessPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<"checking" | "denied">("checking");

  useEffect(() => {
    if (isWebView()) {
      saveTicket("mobileappaccess5y2");
      navigate({ to: "/home" });
    } else {
      setState("denied");
    }
  }, [navigate]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="animate-float absolute -top-40 -left-32 h-[26rem] w-[26rem] rounded-full bg-primary/25 blur-[120px]" />
      <div className="animate-pulse-glow absolute -right-24 -bottom-32 h-[24rem] w-[24rem] rounded-full bg-accent/20 blur-[130px]" />

      <div className="animate-rise glass relative w-full max-w-md rounded-3xl p-8 text-center shadow-[var(--shadow-card)]">
        <div className="flex flex-col items-center">
          <Logo className="h-20" />
        </div>

        {state === "checking" ? (
          <>
            <Loader2 className="mx-auto mt-8 h-6 w-6 animate-spin text-accent" />
            <h1 className="mt-4 text-xl font-bold">Verifying app access…</h1>
            <p className="mt-2 text-sm text-muted-foreground">Unlocking unlimited access.</p>
          </>
        ) : (
          <>
            <ShieldAlert className="mx-auto mt-8 h-8 w-8 text-destructive" />
            <h1 className="mt-4 text-xl font-bold">App access only</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This unlimited access link only works inside the HorizonFlix app. Open it from the app
              instead of a web browser.
            </p>
            <button
              onClick={() => navigate({ to: "/" })}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm text-muted-foreground transition-all duration-300 hover:border-accent hover:text-accent"
            >
              <Smartphone className="h-4 w-4" /> Use a ticket instead
            </button>
          </>
        )}
      </div>
    </main>
  );
}
