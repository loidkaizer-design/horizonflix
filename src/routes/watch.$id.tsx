import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Star, RefreshCw, ArrowLeft } from "lucide-react";
import { Navigation, Attribution, useTicketGuard } from "@/components/Navigation";
import { MovieCard, RowSkeleton } from "@/components/MovieCard";
import { getMovie, getTrending, img, playerUrl, titleOf, year } from "@/lib/tmdb";

export const Route = createFileRoute("/watch/$id")({
  head: () => ({
    meta: [
      { title: "Now Playing — HorizonFlix" },
      { name: "description", content: "Stream the movie with a top 10 sidebar on HorizonFlix." },
      { property: "og:title", content: "Now Playing — HorizonFlix" },
      {
        property: "og:description",
        content: "Stream the movie with a top 10 sidebar on HorizonFlix.",
      },
    ],
  }),
  component: WatchPage,
});

function WatchPage() {
  const ready = useTicketGuard();
  const { id } = Route.useParams();
  const [reloadKey, setReloadKey] = useState(0);

  const movie = useQuery({ queryKey: ["movie", id], queryFn: () => getMovie(id), enabled: ready });
  const top = useQuery({ queryKey: ["trending"], queryFn: getTrending, enabled: ready });

  if (!ready) return <div className="min-h-screen" />;

  const src = playerUrl(movie.data?.imdb_id || id);

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="mx-auto grid max-w-[1500px] gap-8 px-4 pt-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <Link
            to="/movie/$id"
            params={{ id }}
            className="group mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Back to details
          </Link>

          <div className="animate-fade glow overflow-hidden rounded-2xl border border-border bg-black">
            <div className="aspect-video w-full">
              <iframe
                key={reloadKey}
                src={src}
                title={movie.data ? titleOf(movie.data) : "Player"}
                allowFullScreen
                referrerPolicy="origin"
                className="h-full w-full border-0"
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Playback provided by an external source.</span>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 transition-all duration-300 hover:border-accent hover:text-accent"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Retry player
            </button>
          </div>

          {movie.isLoading && <RowSkeleton />}

          {movie.data && (
            <div className="animate-rise mt-6">
              <h1 className="text-2xl font-extrabold sm:text-3xl">{titleOf(movie.data)}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1 text-accent">
                  <Star className="h-4 w-4 fill-current" /> {movie.data.vote_average.toFixed(1)}
                </span>
                <span>{year(movie.data)}</span>
                <span>{movie.data.runtime} min</span>
              </div>
              <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
                {movie.data.overview}
              </p>

              {!!movie.data.credits?.cast?.length && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {movie.data.credits.cast.slice(0, 10).map((c) => (
                    <Link
                      key={c.id}
                      to="/cast/$id"
                      params={{ id: String(c.id) }}
                      className="rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:text-accent"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}

              {!!movie.data.similar?.results?.length && (
                <section className="mt-10">
                  <h2 className="text-lg font-bold">Similar movies</h2>
                  <div className="no-scrollbar mt-4 flex gap-4 overflow-x-auto pb-4">
                    {movie.data.similar.results.slice(0, 12).map((m, i) => (
                      <MovieCard key={m.id} movie={m} index={i} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        <aside className="glass animate-rise h-fit rounded-2xl p-4 lg:sticky lg:top-24">
          <h2 className="mb-3 text-sm font-bold tracking-[0.2em] uppercase">Top 10 this week</h2>
          <ol className="space-y-2">
            {(top.data ?? []).slice(0, 10).map((m, i) => (
              <li key={m.id}>
                <Link
                  to="/watch/$id"
                  params={{ id: String(m.id) }}
                  className="group flex items-center gap-3 rounded-xl p-2 transition-all duration-300 hover:translate-x-1 hover:bg-secondary/70"
                >
                  <span className="w-5 shrink-0 text-center text-lg font-black text-muted-foreground transition-colors group-hover:text-accent">
                    {i + 1}
                  </span>
                  {img(m.poster_path, "w200") ? (
                    <img
                      src={img(m.poster_path, "w200")!}
                      alt={titleOf(m)}
                      loading="lazy"
                      className="h-16 w-11 shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <div className="h-16 w-11 shrink-0 rounded-md bg-secondary" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold group-hover:text-accent">
                      {titleOf(m)}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-current text-accent" />
                      {m.vote_average.toFixed(1)} · {year(m)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </aside>
      </div>
      <Attribution />
    </div>
  );
}
