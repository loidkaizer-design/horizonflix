import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, LogOut, Search, UserRound } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { fetchProfile } from "@/lib/account";
import { supabase } from "@/integrations/supabase/client";

export function useTicketGuard() {
  return true;
}

export function Navigation() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const client = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: Boolean(user),
  });

  async function signOut() {
    await client.cancelQueries();
    client.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled ? "glass shadow-[var(--shadow-card)]" : "bg-transparent"
      }`}
    >
      <div className="mx-auto grid max-w-[1500px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <Link to="/home" className="shrink-0">
            <Logo className="h-9 sm:h-10" />
          </Link>
          <nav className="hidden items-center gap-5 text-sm md:flex">
            <Link
              to="/home"
              className={`relative py-1 transition-colors hover:text-accent ${
                pathname === "/home" ? "text-foreground" : "text-muted-foreground"
              } after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-bottom-right after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100`}
            >
              Home
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) navigate({ to: "/home", search: { q: q.trim() } });
            }}
            className="group relative"
          >
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search movies"
              className="w-36 rounded-full border border-border bg-secondary/60 py-2 pr-3 pl-9 text-sm outline-none transition-all duration-500 focus:w-52 focus:border-accent focus:bg-secondary sm:w-48 sm:focus:w-72"
            />
          </form>
          {user ? (
            <>
              <Link
                to="/watchlist"
                aria-label="Open watchlist"
                className={`rounded-full border p-2 transition-all duration-300 hover:scale-110 hover:border-accent hover:text-accent ${
                  pathname === "/watchlist"
                    ? "border-accent text-accent"
                    : "border-border text-muted-foreground"
                }`}
              >
                <Bookmark className="h-4 w-4" />
              </Link>
              <Link
                to="/profile"
                aria-label="Open profile"
                className="flex items-center gap-2 rounded-full border border-border py-1 pr-3 pl-1 text-sm transition-all duration-300 hover:border-accent hover:text-accent"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary">
                    <UserRound className="h-4 w-4" />
                  </span>
                )}
                <span className="hidden max-w-24 truncate sm:block">
                  {profile?.display_name ?? "Profile"}
                </span>
              </Link>
              <button
                onClick={signOut}
                aria-label="Sign out"
                className="rounded-full border border-border p-2 text-muted-foreground transition-all duration-300 hover:scale-110 hover:border-destructive hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="gradient-violet rounded-full px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform duration-300 hover:scale-105"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function Attribution() {
  return (
    <footer className="mt-20 border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
      <p className="tracking-[0.3em] uppercase">HorizonFlix</p>
      <p className="mt-2">
        Powered by <span className="font-semibold text-accent">Fantomistic</span>
      </p>
      <p className="mt-3">All Rights reserved 2026 SkyPierce.</p>
    </footer>
  );
}
