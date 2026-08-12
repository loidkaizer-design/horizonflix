import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { clearTicket, getTicket } from "@/lib/ticket";

export function useTicketGuard() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!getTicket()) {
      navigate({ to: "/" });
    } else {
      setReady(true);
    }
  }, [navigate]);
  return ready;
}

export function Navigation() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

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
            {[
              { to: "/home", label: "Home" },
              { to: "/home", label: "Trending", hash: "trending" },
            ].map((l, i) => (
              <Link
                key={i}
                to={l.to}
                hash={l.hash}
                className={`relative py-1 transition-colors hover:text-accent ${
                  pathname === l.to ? "text-foreground" : "text-muted-foreground"
                } after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-bottom-right after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100`}
              >
                {l.label}
              </Link>
            ))}
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
          <button
            aria-label="Sign out"
            onClick={() => {
              clearTicket();
              navigate({ to: "/" });
            }}
            className="rounded-full border border-border p-2 text-muted-foreground transition-all duration-300 hover:scale-110 hover:border-accent hover:text-accent"
          >
            <LogOut className="h-4 w-4" />
          </button>
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
    </footer>
  );
}
