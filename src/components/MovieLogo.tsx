import { useQuery } from "@tanstack/react-query";
import { getMovieLogos, preferredLogoUrl } from "@/lib/fandomhub";
import { titleOf, type Movie } from "@/lib/tmdb";

export function MovieLogo({ movie, className = "" }: { movie: Movie; className?: string }) {
  const { data } = useQuery({
    queryKey: ["movie-logo", movie.id],
    queryFn: () => getMovieLogos(movie.id),
    staleTime: 1000 * 60 * 60,
  });
  const logo = data?.map(preferredLogoUrl).find(Boolean);
  return logo ? (
    <img
      src={logo}
      alt={titleOf(movie)}
      className={`max-h-28 max-w-full object-contain object-left ${className}`}
    />
  ) : (
    <span className={className}>{titleOf(movie)}</span>
  );
}
