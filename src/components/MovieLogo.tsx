import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOfficialMovieLogo } from "@/lib/movie-logos";
import { titleOf, type Movie } from "@/lib/tmdb";

export function MovieLogo({ movie, className = "" }: { movie: Movie; className?: string }) {
  const [imageFailed, setImageFailed] = useState(false);
  const { data: logoUrl, isLoading } = useQuery({
    queryKey: ["official-movie-logo", movie.id],
    queryFn: () => getOfficialMovieLogo(movie.id),
    staleTime: 1000 * 60 * 60,
  });
  const showLogo = Boolean(logoUrl) && !imageFailed;

  return (
    <span className={`flex min-h-14 w-full items-center ${className}`}>
      {showLogo ? (
        <img
          key={`${movie.id}-${logoUrl}`}
          src={logoUrl!}
          alt={titleOf(movie)}
          onError={() => setImageFailed(true)}
          className="max-h-14 max-w-full object-contain object-left"
        />
      ) : (
        <span className="line-clamp-2 leading-tight">
          {titleOf(movie)}
        </span>
      )}
    </span>
  );
}
