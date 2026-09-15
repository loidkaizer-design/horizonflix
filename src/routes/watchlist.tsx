import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Attribution, Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { fetchWatchlist, removeFromWatchlist } from "@/lib/account";
import { img } from "@/lib/tmdb";

export const Route = createFileRoute("/watchlist")({
  head: () => ({
    meta: [
      { title: "Your Watchlist — Kanto-Flix" },
      { name: "description", content: "Movies you saved to watch later on Kanto-Flix." },
      { property: "og:title", content: "Your Watchlist — Kanto-Flix" },
      { property: "og:description", content: "Movies you saved to watch later on Kanto-Flix." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WatchlistPage,
});

function WatchlistPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const client = useQueryClient();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const query = useQuery({
    queryKey: ["watchlist", user?.id],
    queryFn: fetchWatchlist,
    enabled: Boolean(user),
  });

  const remove = useMutation({
    mutationFn: (movieId: number) => removeFromWatchlist(movieId),
    onSuccess: () => client.invalidateQueries({ queryKey: ["watchlist", user?.id] }),
  });

  const items = query.data ?? [];

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" /> Back to browse
        </Link>
        <h1 className="mt-6 text-3xl font-extrabold">Your watchlist</h1>
        <p className="mt-2 text-sm text-muted-foreground">Titles you saved for later.</p>

        {query.isLoading && <p className="mt-8 text-sm text-muted-foreground">Loading...</p>}
        {!query.isLoading && !items.length && (
          <p className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nothing saved yet. Tap "Add to watchlist" on any movie.
          </p>
        )}

        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((entry, i) => (
            <div
              key={entry.id}
              className="animate-rise group relative"
              style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
            >
              <Link to="/movie/$id" params={{ id: String(entry.movie_id) }}>
                <div className="overflow-hidden rounded-2xl border border-border bg-card transition-transform duration-500 group-hover:scale-105">
                  {img(entry.poster_path, "w500") ? (
                    <img
                      src={img(entry.poster_path, "w500")!}
                      alt={entry.title ?? "Saved movie"}
                      loading="lazy"
                      className="aspect-[2/3] w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[2/3] items-center justify-center p-3 text-center text-xs text-muted-foreground">
                      {entry.title ?? `Movie #${entry.movie_id}`}
                    </div>
                  )}
                </div>
                <p className="mt-2 truncate text-sm font-medium group-hover:text-accent">
                  {entry.title ?? `Movie #${entry.movie_id}`}
                </p>
              </Link>
              <button
                onClick={() => remove.mutate(entry.movie_id)}
                aria-label="Remove from watchlist"
                className="absolute top-2 right-2 rounded-full bg-background/80 p-2 text-muted-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </main>
      <Attribution />
    </div>
  );
}
