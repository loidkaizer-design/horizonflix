import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Play, Star, Clock, Calendar } from "lucide-react";
import { Navigation, Attribution, useTicketGuard } from "@/components/Navigation";
import { MovieCard, RowSkeleton } from "@/components/MovieCard";
import { getMovie, img, titleOf, year } from "@/lib/tmdb";

export const Route = createFileRoute("/movie/$id")({
  head: () => ({
    meta: [
      { title: "Movie Details — HorizonFlix" },
      {
        name: "description",
        content: "Synopsis, rating, cast and gallery for this title on HorizonFlix.",
      },
      { property: "og:title", content: "Movie Details — HorizonFlix" },
      {
        property: "og:description",
        content: "Synopsis, rating, cast and gallery for this title on HorizonFlix.",
      },
    ],
  }),
  component: MoviePage,
});

function MoviePage() {
  const ready = useTicketGuard();
  const { id } = Route.useParams();
  const { data: movie, isLoading, isError } = useQuery({
    queryKey: ["movie", id],
    queryFn: () => getMovie(id),
    enabled: ready,
  });

  if (!ready) return <div className="min-h-screen" />;

  return (
    <div className="min-h-screen">
      <div className="relative">
        <div className="absolute inset-0 -z-10 h-[60vh] overflow-hidden bg-[image:var(--gradient-violet)]">
          {movie?.backdrop_path && (
            <img
              src={img(movie.backdrop_path, "original")!}
              alt=""
              className="animate-fade h-full w-full object-cover opacity-25"
            />
          )}
          {movie && (
            <div className="absolute inset-0 overflow-hidden">
              <iframe
                src={`https://tmdbtrailor-dx8n9dfo.manus.space/trailer/tmdb/${movie.id}`}
                title={`${titleOf(movie)} trailer background`}
                allow="autoplay; encrypted-media"
                referrerPolicy="no-referrer"
                className="animate-trailer pointer-events-none absolute top-1/2 left-1/2 h-[180%] w-[180%] -translate-x-1/2 -translate-y-1/2 scale-110 opacity-45"
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/55 to-background/10" />
          <div className="absolute inset-0 bg-[image:var(--gradient-fade)]" />
        </div>
        <Navigation />

        <div className="mx-auto max-w-[1200px] px-4 pt-8 sm:px-8">
          <Link
            to="/home"
            className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Back to browse
          </Link>

          {isLoading && <RowSkeleton />}
          {isError && (
            <p className="mt-10 text-destructive">
              We couldn't load this title. Please try again.
            </p>
          )}

          {movie && (
            <>
              <div className="mt-6 flex flex-col gap-8 md:flex-row">
                {img(movie.poster_path, "w500") && (
                  <div className="flex w-52 shrink-0 flex-col gap-4 md:w-64">
                    <img
                      src={img(movie.poster_path, "w500")!}
                      alt={titleOf(movie)}
                      className="animate-rise w-full rounded-2xl shadow-[var(--shadow-card)]"
                    />
                    <Link
                      to="/watch/$id"
                      params={{ id: String(movie.id) }}
                      className="gradient-violet glow inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 font-semibold text-primary-foreground transition-transform duration-300 hover:scale-105"
                    >
                      <Play className="h-4 w-4 fill-current" /> Watch now
                    </Link>
                  </div>
                )}
                <div className="animate-rise min-w-0" style={{ animationDelay: "80ms" }}>
                  <h1 className="text-3xl font-extrabold sm:text-5xl">{titleOf(movie)}</h1>
                  {movie.tagline && (
                    <p className="mt-2 text-sm text-accent italic">{movie.tagline}</p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1 text-accent">
                      <Star className="h-4 w-4 fill-current" /> {movie.vote_average.toFixed(1)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-4 w-4" /> {year(movie) || "—"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {movie.runtime || "?"} min
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {movie.genres?.map((g) => (
                      <span
                        key={g.id}
                        className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs transition-colors hover:border-accent hover:text-accent"
                      >
                        {g.name}
                      </span>
                    ))}
                  </div>
                  <p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground">
                    {movie.overview}
                  </p>
                </div>
              </div>

              {!!movie.credits?.cast?.length && (
                <section className="mt-14">
                  <h2 className="text-xl font-bold">Cast</h2>
                  <div className="no-scrollbar mt-4 flex gap-5 overflow-x-auto pb-4">
                    {movie.credits.cast.slice(0, 20).map((c, i) => (
                      <Link
                        key={c.id}
                        to="/cast/$id"
                        params={{ id: String(c.id) }}
                        className="animate-rise group w-28 shrink-0 text-center"
                        style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
                      >
                        <div className="mx-auto h-28 w-28 overflow-hidden rounded-full border-2 border-transparent bg-card transition-all duration-500 group-hover:scale-105 group-hover:border-accent">
                          {img(c.profile_path, "w300") ? (
                            <img
                              src={img(c.profile_path, "w300")!}
                              alt={c.name}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                              {c.name.slice(0, 2)}
                            </div>
                          )}
                        </div>
                        <p className="mt-2 truncate text-sm font-medium group-hover:text-accent">
                          {c.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{c.character}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {!!movie.images?.backdrops?.length && (
                <section className="mt-12">
                  <h2 className="text-xl font-bold">Gallery</h2>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {movie.images.backdrops.slice(0, 6).map((b, i) => (
                      <img
                        key={b.file_path}
                        src={img(b.file_path, "w780")!}
                        alt={`${titleOf(movie)} still ${i + 1}`}
                        loading="lazy"
                        className="hover-lift animate-rise aspect-video w-full rounded-xl object-cover"
                        style={{ animationDelay: `${i * 60}ms` }}
                      />
                    ))}
                  </div>
                </section>
              )}

              {!!movie.similar?.results?.length && (
                <section className="mt-12">
                  <h2 className="text-xl font-bold">More like this</h2>
                  <div className="no-scrollbar mt-4 flex gap-4 overflow-x-auto pb-4">
                    {movie.similar.results.slice(0, 14).map((m, i) => (
                      <MovieCard key={m.id} movie={m} index={i} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
      <Attribution />
    </div>
  );
}
