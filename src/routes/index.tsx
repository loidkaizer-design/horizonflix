import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Attribution } from "@/components/Navigation";
import { generateUserId } from "@/lib/fandomhub";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HorizonFlix — Find Your Next Favorite" },
      { name: "description", content: "Browse, watch, and talk about the movies you love." },
    ],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  const navigate = useNavigate();
  useEffect(() => {
    const start = async () => {
      if (!localStorage.getItem("horizonflix-user-id")) {
        try {
          const result = await generateUserId();
          localStorage.setItem(
            "horizonflix-user-id",
            result.userId ?? result.id ?? `hrfx${Math.floor(Math.random() * 900000 + 100000)}`,
          );
        } catch {
          localStorage.setItem(
            "horizonflix-user-id",
            `hrfx${Math.floor(Math.random() * 900000 + 100000)}`,
          );
        }
      }
      navigate({ to: "/home", replace: true });
    };
    void start();
  }, [navigate]);
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div className="animate-float absolute -top-40 -left-32 h-[26rem] w-[26rem] rounded-full bg-primary/25 blur-[120px]" />
      <div className="animate-pulse-glow absolute -right-24 -bottom-32 h-[24rem] w-[24rem] rounded-full bg-accent/20 blur-[130px]" />
      <div className="glass relative w-full max-w-lg rounded-3xl p-8 text-center shadow-[var(--shadow-card)] sm:p-12">
        <Logo className="mx-auto h-24" />
        <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
          <Sparkles className="h-3.5 w-3.5" /> Your cinema, your conversation
        </p>
        <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
          Find your next favorite story.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Jump into a living catalogue of movies, official artwork, and conversations with fellow
          fans.
        </p>
        <button
          onClick={() => navigate({ to: "/home" })}
          className="gradient-violet mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-primary-foreground"
        >
          Enter HorizonFlix <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <Attribution />
    </main>
  );
}
