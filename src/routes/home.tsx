import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Play, Info, Star } from "lucide-react";
import { Navigation, Attribution, useTicketGuard } from "@/components/Navigation";
import { MovieCard, MovieRow, RowSkeleton } from "@/components/MovieCard";
import {
  GENRES,
  getByGenre,
  getList,
  getTrending,
  dedupeMovieGroups,
  img,
  searchMovies,
  titleOf,
  year,
  type Movie,
} from "@/lib/tmdb";

type HomeSearch = { q?: string };

export const Route = createFileRoute("/home")({
  validateSearch: (search: Record<string, unknown>): HomeSearch =>
    typeof search["q"] === "string" && search["q"] ? { q: search["q"] } : {},
  head: () => ({
    meta: [
      { title: "Browse Movies — HorizonFlix" },
      {
        name: "description",
        content: "Trending, action, comedy and top rated movies, streaming instantly on HorizonFlix.",
      },
      { property: "og:title", content: "Browse Movies — HorizonFlix" },
      {
        property: "og:description",
        content: "Trending, action, comedy and top rated movies, streaming instantly.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const ready = useTicketGuard();
  const { q } = Route.useSearch();

  const trending = useQuery({ queryKey: ["trending"], queryFn: getTrending, enabled: ready });
  const genreRows = useQueries({
    queries: GENRES.map((g) => ({
      queryKey: ["genre", g.id],
      queryFn: () => getByGenre(g.id),
      enabled: ready,
    })),
  });
  const top = useQuery({ queryKey: ["top_rated"], queryFn: () => getList("top_rated"), enabled: ready });
  const popular = useQuery({ queryKey: ["popular"], queryFn: () => getList("popular"), enabled: ready });
  const nowPlaying = useQuery({ queryKey: ["now_playing"], queryFn: () => getList("now_playing"), enabled: ready });
  const upcoming = useQuery({ queryKey: ["upcoming"], queryFn: () => getList("upcoming"), enabled: ready });
  const results = useQuery({
    queryKey: ["search", q],
    queryFn: () => searchMovies(q!),
    enabled: ready && !!q,
  });

  const hero: Movie | undefined = trending.data?.[0];
  const [uniqueTrending, uniquePopular, uniqueNowPlaying, uniqueTop, uniqueUpcoming, ...uniqueGenres] =
    dedupeMovieGroups([
      trending.data ?? [],
      popular.data ?? [],
      nowPlaying.data ?? [],
      top.data ?? [],
      upcoming.data ?? [],
      ...genreRows.map((query) => query.data ?? []),
    ]);

  if (!ready) return <div className="min-h-screen" />;

  return (
    <div className="min-h-screen">
      <div className="relative">
        <div className="absolute inset-0 -z-10 h-[70vh]">
          {hero?.backdrop_path && (
            <img
              src={img(hero.backdrop_path, "original")!}
              alt=""
              className="animate-fade h-full w-full object-cover opacity-45"
            />
          )}
          <div className="absolute inset-0 bg-[image:var(--gradient-fade)]" />
        </div>

        <Navigation />

        {q ? (
          <section className="px-4 pt-10 sm:px-8">
            <h1 className="animate-rise text-2xl font-bold sm:text-3xl">
              Results for “{q}”
            </h1>
            {results.isLoading ? (
              <RowSkeleton />
            ) : results.data?.length ? (
              <div className="mt-6 flex flex-wrap gap-4">
                {results.data.map((m, i) => (
                  <MovieCard key={m.id} movie={m} index={i} />
                ))}
              </div>
            ) : (
              <p className="mt-6 text-muted-foreground">No movies matched that search.</p>
            )}
          </section>
        ) : (
          <section className="flex min-h-[62vh] flex-col justify-end px-4 pt-16 pb-6 sm:px-8">
            {hero && (
              <div className="animate-rise max-w-2xl">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold tracking-wide text-accent uppercase">
                  #1 Trending this week
                </span>
                <h1 className="mt-4 text-4xl leading-tight font-extrabold sm:text-6xl">
                  {titleOf(hero)}
                </h1>
                <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1 text-accent">
                    <Star className="h-4 w-4 fill-current" />
                    {hero.vote_average.toFixed(1)}
                  </span>
                  <span>{year(hero)}</span>
                </div>
                <p className="mt-4 line-clamp-3 text-sm text-muted-foreground sm:text-base">
                  {hero.overview}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/watch/$id"
                    params={{ id: String(hero.id) }}
                    className="gradient-violet glow group inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-primary-foreground transition-transform duration-300 hover:scale-105"
                  >
                    <Play className="h-4 w-4 fill-current" /> Watch now
                  </Link>
                  <Link
                    to="/movie/$id"
                    params={{ id: String(hero.id) }}
                    className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition-all duration-300 hover:scale-105 hover:text-accent"
                  >
                    <Info className="h-4 w-4" /> More info
                  </Link>
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {!q && (
        <div className="pb-10">
          {trending.isLoading ? (
            <RowSkeleton />
          ) : (
            <MovieRow title="Trending Now" movies={uniqueTrending} />
          )}
          <MovieRow title="Popular" movies={uniquePopular} />
          <MovieRow title="Now Playing" movies={uniqueNowPlaying} />
          <MovieRow title="Top Rated" movies={uniqueTop} />
          <MovieRow title="Coming Soon" movies={uniqueUpcoming} />
          {GENRES.map((g, i) => (
            <MovieRow key={g.id} title={g.name} movies={uniqueGenres[i] ?? []} />
          ))}
          {trending.isError && (
            <p className="px-8 pt-10 text-sm text-destructive">
              Couldn't load the catalogue right now. Please refresh to try again.
            </p>
          )}
        </div>
      )}

      <Attribution />
    </div>
  );
}
