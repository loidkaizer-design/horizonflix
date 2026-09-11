import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { addToWatchlist, fetchWatchlist, removeFromWatchlist } from "@/lib/account";

export function WatchlistButton({
  movieId,
  title,
  posterPath,
}: {
  movieId: number;
  title?: string | null;
  posterPath?: string | null;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const client = useQueryClient();

  const { data } = useQuery({
    queryKey: ["watchlist", user?.id],
    queryFn: fetchWatchlist,
    enabled: Boolean(user),
  });

  const saved = (data ?? []).some((entry) => entry.movie_id === movieId);

  const toggle = useMutation({
    mutationFn: async () => {
      if (!user) return;
      if (saved) await removeFromWatchlist(movieId);
        else
          await addToWatchlist({
            userId: user.id,
            movieId,
            title: title ?? null,
            posterPath: posterPath ?? null,
          });
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ["watchlist", user?.id] }),
  });

  return (
    <button
      onClick={() => (user ? toggle.mutate() : navigate({ to: "/auth" }))}
      disabled={toggle.isPending}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-all duration-300 hover:scale-105 ${
        saved
          ? "border-accent text-accent"
          : "border-border text-muted-foreground hover:border-accent hover:text-accent"
      }`}
    >
      {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      {saved ? "In your watchlist" : "Add to watchlist"}
    </button>
  );
}
