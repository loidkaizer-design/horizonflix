import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Mail, Lock, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or join — HorizonFlix" },
      {
        name: "description",
        content:
          "Create a free HorizonFlix account to comment on movies, build a watchlist and customise your profile.",
      },
      { property: "og:title", content: "Sign in or join — HorizonFlix" },
      {
        property: "og:description",
        content: "Free account for comments, watchlist and your own profile on HorizonFlix.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/home" });
  }, [loading, user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    if (mode === "signup") {
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { display_name: displayName.trim() || email.split("@")[0] },
        },
      });
      setBusy(false);
      if (err) return setError(err.message);
      if (!data.session) return setNotice("Check your email to confirm your account, then sign in.");
      navigate({ to: "/home" });
      return;
    }
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (err) return setError(err.message);
    navigate({ to: "/home" });
  }

  async function onGoogle() {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in didn't work. Try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/home" });
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="animate-float absolute -top-40 -left-32 h-[26rem] w-[26rem] rounded-full bg-primary/25 blur-[120px]" />
      <div className="animate-pulse-glow absolute -right-24 -bottom-32 h-[24rem] w-[24rem] rounded-full bg-accent/20 blur-[130px]" />

      <div className="animate-rise glass relative w-full max-w-md rounded-3xl p-8 shadow-[var(--shadow-card)]">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Keep browsing as guest
        </Link>

        <div className="mt-4 flex flex-col items-center text-center">
          <Logo className="h-16" />
          <h1 className="mt-4 text-xl font-bold">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Comment on movies, save a watchlist and build your profile.
          </p>
        </div>

        <button
          onClick={onGoogle}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold transition-all duration-300 hover:border-accent hover:text-accent"
        >
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && (
            <div className="relative">
              <UserRound className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display name"
                className="w-full rounded-xl border border-border bg-secondary/60 py-3 pr-4 pl-11 text-sm outline-none transition-all focus:border-accent"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              className="w-full rounded-xl border border-border bg-secondary/60 py-3 pr-4 pl-11 text-sm outline-none transition-all focus:border-accent"
            />
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="w-full rounded-xl border border-border bg-secondary/60 py-3 pr-4 pl-11 text-sm outline-none transition-all focus:border-accent"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
              {error}
            </p>
          )}
          {notice && (
            <p className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="gradient-violet flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setNotice(null);
          }}
          className="mt-5 w-full text-center text-xs text-muted-foreground transition-colors hover:text-accent"
        >
          {mode === "signin"
            ? "New here? Create a free account"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
