import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { img, titleOf, year, type Movie } from "@/lib/tmdb";

export function MovieCard({ movie, index = 0 }: { movie: Movie; index?: number }) {
  const poster = img(movie.poster_path, "w500");
  return (
    <Link
      to="/movie/$id"
      params={{ id: String(movie.id) }}
      className="hover-lift group animate-rise block w-[150px] shrink-0 sm:w-[180px]"
      style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
    >
      <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-card shadow-[var(--shadow-card)]">
        {poster ? (
          <img
            src={poster}
            alt={titleOf(movie)}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-3 text-center text-xs text-muted-foreground">
            {titleOf(movie)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute bottom-2 left-2 flex translate-y-3 items-center gap-1 rounded-full bg-primary/90 px-2 py-0.5 text-[11px] font-semibold text-primary-foreground opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <Star className="h-3 w-3 fill-current" />
          {movie.vote_average?.toFixed(1)}
        </div>
      </div>
      <p className="mt-2 truncate text-sm font-semibold transition-colors group-hover:text-accent">
        {titleOf(movie)}
      </p>
      <p className="text-xs text-muted-foreground">{year(movie) || "—"}</p>
    </Link>
  );
}

export function MovieRow({ title, movies }: { title: string; movies: Movie[] }) {
  if (!movies?.length) return null;
  return (
    <section className="animate-fade mt-10">
      <h2 className="mb-4 px-4 text-lg font-bold sm:px-8 sm:text-xl">{title}</h2>
      <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 pb-4 sm:px-8">
        {movies.slice(0, 40).map((m, i) => (
          <MovieCard key={m.id} movie={m} index={i} />
        ))}
      </div>
    </section>
  );
}

export function CardSkeleton() {
  return <div className="shimmer aspect-2/3 w-[150px] shrink-0 rounded-xl sm:w-[180px]" />;
}

export function RowSkeleton() {
  return (
    <div className="relative mt-10 px-4 sm:px-8">
      <div className="pointer-events-none absolute -top-8 left-1/4 h-20 w-40 rounded-full bg-primary/15 blur-3xl animate-orb" />
      <div className="mb-4 flex items-center gap-3">
        <div className="shimmer h-5 w-40 rounded" />
        <div className="gradient-loader h-1.5 w-16 rounded-full" />
      </div>
      <div className="no-scrollbar flex gap-4 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
