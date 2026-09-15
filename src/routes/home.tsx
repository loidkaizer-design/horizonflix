import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Info, Play, Star } from "lucide-react";
import { Navigation, Attribution, useTicketGuard } from "@/components/Navigation";
import { MovieCard, MovieRow, RowSkeleton } from "@/components/MovieCard";
import { MovieLogo } from "@/components/MovieLogo";
import {
  getLatest,
  getPinoyMovies,
  getPopular,
  getTrending,
  img,
  searchMovies,
  titleOf,
  year,
  type Movie,
} from "@/lib/tmdb";

type HomeSearch = { q?: string };
export const Route = createFileRoute("/home")({
  validateSearch: (search: Record<string, unknown>): HomeSearch =>
    typeof search.q === "string" && search.q ? { q: search.q } : {},
  head: () => ({
    meta: [
      { title: "Browse Movies — Kanto-Flix" },
      { name: "description", content: "Your neighborhood cinema for the latest movies." },
    ],
  }),
  component: HomePage,
});

/**
 * Tracks how far the user has scrolled past the top of the page,
 * normalized to [0, 1] over `pinDistance` pixels (defaults to 30vh).
 * 0 = hero fully visible, 1 = hero fully covered by the categories overlay.
 */
function useHeroPinProgress(pinDistanceVh = 30) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const pin = Math.max(1, (window.innerHeight * pinDistanceVh) / 100);
      const p = Math.min(1, Math.max(0, window.scrollY / pin));
      setProgress(p);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pinDistanceVh]);
  return progress;
}

function HomePage() {
  const ready = useTicketGuard();
  const { q } = Route.useSearch();
  const [active, setActive] = useState(0);
  const pin = useHeroPinProgress(30);
  const trending = useQuery({
    queryKey: ["trending"],
    queryFn: getTrending,
    enabled: ready && typeof window !== "undefined",
    staleTime: 1000 * 60 * 10,
  });
  const popular = useQuery({
    queryKey: ["popular"],
    queryFn: getPopular,
    enabled: ready && typeof window !== "undefined",
    staleTime: 1000 * 60 * 10,
  });
  const pinoy = useQuery({
    queryKey: ["pinoy"],
    queryFn: getPinoyMovies,
    enabled: ready && typeof window !== "undefined",
    staleTime: 1000 * 60 * 10,
  });
  const latest = useQuery({
    queryKey: ["latest"],
    queryFn: getLatest,
    enabled: ready && typeof window !== "undefined",
    staleTime: 1000 * 60 * 10,
  });
  const results = useQuery({
    queryKey: ["search", q],
    queryFn: () => searchMovies(q!),
    enabled: ready && typeof window !== "undefined" && !!q,
  });
  const heroMovies = (trending.data ?? []).filter((m) => m.backdrop_path).slice(0, 16);
  const hero = heroMovies[active % Math.max(heroMovies.length, 1)];
  const suggestedMovies = useMemo(() => {
    const unique = new Map<number, Movie>();
    [...(trending.data ?? []), ...(popular.data ?? []), ...(latest.data ?? []), ...(pinoy.data ?? [])].forEach(
      (movie) => unique.set(movie.id, movie),
    );
    return Array.from(unique.values()).sort(() => Math.random() - 0.5);
  }, [trending.data, popular.data, latest.data, pinoy.data]);

  useEffect(() => {
    if (heroMovies.length < 2) return;
    const timer = window.setInterval(() => setActive((i) => (i + 1) % heroMovies.length), 7000);
    return () => window.clearInterval(timer);
  }, [heroMovies.length]);
  useEffect(() => {
    if (active >= heroMovies.length) setActive(0);
  }, [active, heroMovies.length]);
  if (!ready) return <div className="min-h-screen" />;

  // Pinning transforms — applied to hero content so it recedes smoothly
  // as the categories section slides up over it.
  const heroScale = 1 - pin * 0.18;
  const heroOpacity = 1 - pin * 0.9;
  const heroBlur = pin * 6;
  const heroParallaxY = pin * -60;
  const heroContent = useMemo(
    () => ({
      transform: `scale(${heroScale}) translateY(${heroParallaxY}px)`,
      opacity: heroOpacity,
      filter: `blur(${heroBlur}px)`,
    }),
    [heroScale, heroOpacity, heroBlur, heroParallaxY],
  );
  const indicatorOpacity = Math.max(0, 1 - pin * 2.5);

  return (
    <div className="min-h-screen">
      <Navigation />
      {q ? (
        <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-8">
          <h1 className="text-2xl font-bold sm:text-3xl">Results for “{q}”</h1>
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
        <>
          {/*
            Scroll-pinned hero — the wrapper reserves extra scroll room (30vh)
            so the sticky <section> stays pinned while the categories <main>
            slides up over it. z-0 puts the hero BEHIND main.
          */}
          <div
            className="relative z-0"
            style={{ height: "calc(100svh - 4rem + 30vh)" }}
          >
            <section className="sticky top-16 z-0 h-[calc(100svh-4rem)] overflow-hidden">
              <div className="absolute inset-0 bg-black">
                {hero && (
                  <img
                    key={hero.id}
                    src={img(hero.backdrop_path, "original")!}
                    alt=""
                    className="h-full w-full object-cover opacity-60 transition-opacity duration-1000"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/75 to-background/10" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/10" />
              </div>
              <div
                className="relative mx-auto flex h-full max-w-7xl items-end px-4 pb-20 pt-24 sm:px-8"
                style={heroContent}
              >
                <div className="max-w-2xl">
                  {hero ? (
                    <>
                      <p className="mb-4 text-xs font-bold tracking-[0.28em] text-accent uppercase">
                        Kanto-Flix spotlight · {active + 1} / {heroMovies.length || 16}
                      </p>
                      <h1 className="min-h-16 text-4xl font-black sm:text-6xl">
                        <MovieLogo movie={hero} className="max-h-28 max-w-[min(520px,85vw)]" />
                      </h1>
                      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1 text-accent">
                          <Star className="size-4 fill-current" /> {hero.vote_average.toFixed(1)}
                        </span>
                        <span>{year(hero)}</span>
                      </div>
                      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {hero.overview}
                      </p>
                      <div className="mt-7 flex flex-wrap gap-3">
                        <Link
                          to="/watch/$id"
                          params={{ id: String(hero.id) }}
                          className="gradient-violet glow inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-primary-foreground"
                        >
                          <Play className="size-4 fill-current" /> Watch now
                        </Link>
                        <Link
                          to="/movie/$id"
                          params={{ id: String(hero.id) }}
                          className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold hover:text-accent"
                        >
                          <Info className="size-4" /> More info
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="max-w-md">
                      <h1 className="text-3xl font-bold">Your neighborhood cinema</h1>
                      <p className="mt-3 text-muted-foreground">
                        Loading the latest movies from TMDB…
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {heroMovies.length > 1 && (
                <div className="absolute right-4 bottom-8 left-4 mx-auto flex max-w-7xl items-center justify-between sm:right-8 sm:left-8">
                  <div className="flex gap-1.5">
                    {heroMovies.map((movie, index) => (
                      <button
                        key={movie.id}
                        aria-label={`Show ${titleOf(movie)}`}
                        onClick={() => setActive(index)}
                        className={`h-1.5 rounded-full transition-all ${index === active ? "w-9 bg-accent" : "w-3 bg-foreground/30 hover:bg-foreground/60"}`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setActive((i) => (i - 1 + heroMovies.length) % heroMovies.length)
                      }
                      aria-label="Previous spotlight"
                      className="glass rounded-full p-2 hover:text-accent"
                    >
                      <ChevronLeft className="size-5" />
                    </button>
                    <button
                      onClick={() => setActive((i) => (i + 1) % heroMovies.length)}
                      aria-label="Next spotlight"
                      className="glass rounded-full p-2 hover:text-accent"
                    >
                      <ChevronRight className="size-5" />
                    </button>
                  </div>
                </div>
              )}
              {/* Scroll-down indicator — fades out as the user starts scrolling */}
              <div
                className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground transition-opacity duration-500"
                style={{ opacity: indicatorOpacity }}
              >
                <span className="text-[10px] font-semibold tracking-[0.3em] uppercase">
                  Scroll
                </span>
                <ChevronDown className="size-5 animate-bounce" />
              </div>
            </section>
          </div>
        </>
      )}
      {!q && (
        <main
          className="hero-overlay relative z-10 -mt-[30vh] rounded-t-[2rem] border-t border-border/60 bg-background pb-12 shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.85)]"
        >
          <div className="mx-auto max-w-7xl">
          <section>
            <MovieSection
              title="Most Watched"
              eyebrow="Popular with the neighborhood"
              movies={popular.data ?? []}
              loading={popular.isLoading}
            />
          </section>
          <MovieSection
            title="Pinoy Movies"
            eyebrow="Stories from home"
            movies={pinoy.data ?? []}
            loading={pinoy.isLoading}
          />
          <MovieSection
            title="Latest"
            eyebrow="Fresh from the cinema"
            movies={latest.data ?? []}
            loading={latest.isLoading}
          />
          <div className="mt-10 border-t border-border/60 pt-2">
            <MovieSection
              title="Suggested for You"
              eyebrow="A random bundle for tonight"
              movies={suggestedMovies}
              loading={trending.isLoading || popular.isLoading || latest.isLoading}
            />
            <MovieSection
              title="More Movie Picks"
              eyebrow="Keep exploring the neighborhood"
              movies={[...suggestedMovies].reverse()}
              loading={trending.isLoading || popular.isLoading || latest.isLoading}
            />
            <MovieSection
              title="Just Press Play"
              eyebrow="Random picks, no overthinking"
              movies={suggestedMovies.slice(5).concat(suggestedMovies.slice(0, 5))}
              loading={trending.isLoading || popular.isLoading || latest.isLoading}
            />
          </div>
          </div>
        </main>
      )}
      <Attribution />
    </div>
  );
}
function MovieSection({
  title,
  eyebrow,
  movies,
  loading,
}: {
  title: string;
  eyebrow: string;
  movies: Movie[];
  loading: boolean;
}) {
  const lovengo: Movie = {
    id: 1700944,
    title: "Lovengo",
    poster_path: null,
    backdrop_path: null,
    vote_average: 0,
    overview: "",
  };
  const list =
    title === "Pinoy Movies" && !movies.some((m) => m.id === lovengo.id)
      ? [lovengo, ...movies]
      : movies;
  return (
    <section className="mt-8">
      <div className="flex items-end justify-between px-4 sm:px-8">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">{eyebrow}</p>
          <h2 className="mt-1 text-2xl font-black sm:text-3xl">{title}</h2>
        </div>
      </div>
      {loading ? <RowSkeleton /> : <MovieRow title="" movies={list.slice(0, 16)} />}
    </section>
  );
}
