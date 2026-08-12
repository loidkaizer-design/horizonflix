import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Navigation, Attribution, useTicketGuard } from "@/components/Navigation";
import { MovieCard, RowSkeleton } from "@/components/MovieCard";
import { getPerson, img } from "@/lib/tmdb";

export const Route = createFileRoute("/cast/$id")({
  head: () => ({
    meta: [
      { title: "Cast Profile — HorizonFlix" },
      { name: "description", content: "Biography and full filmography for this actor." },
      { property: "og:title", content: "Cast Profile — HorizonFlix" },
      { property: "og:description", content: "Biography and full filmography for this actor." },
    ],
  }),
  component: CastPage,
});

function CastPage() {
  const ready = useTicketGuard();
  const { id } = Route.useParams();
  const { data: person, isLoading, isError } = useQuery({
    queryKey: ["person", id],
    queryFn: () => getPerson(id),
    enabled: ready,
  });

  if (!ready) return <div className="min-h-screen" />;

  const films = [...(person?.movie_credits?.cast ?? [])].sort(
    (a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0),
  );

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="mx-auto max-w-[1200px] px-4 pt-6 sm:px-8">
        <Link
          to="/home"
          className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to browse
        </Link>

        {isLoading && <RowSkeleton />}
        {isError && <p className="mt-10 text-destructive">Couldn't load this profile.</p>}

        {person && (
          <>
            <div className="mt-6 flex flex-col gap-8 sm:flex-row">
              {img(person.profile_path, "w500") ? (
                <img
                  src={img(person.profile_path, "w500")!}
                  alt={person.name}
                  className="animate-rise w-48 shrink-0 self-start rounded-2xl shadow-[var(--shadow-card)]"
                />
              ) : null}
              <div className="animate-rise min-w-0" style={{ animationDelay: "80ms" }}>
                <h1 className="text-3xl font-extrabold sm:text-4xl">{person.name}</h1>
                <p className="mt-2 text-sm text-accent">
                  {person.known_for_department} · {films.length} movies
                </p>
                {person.place_of_birth && (
                  <p className="mt-1 text-sm text-muted-foreground">{person.place_of_birth}</p>
                )}
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {person.biography || "No biography available for this person yet."}
                </p>
              </div>
            </div>

            <section className="mt-12">
              <h2 className="text-xl font-bold">Filmography</h2>
              <div className="mt-4 flex flex-wrap gap-4 pb-6">
                {films.slice(0, 40).map((m, i) => (
                  <MovieCard key={`${m.id}-${i}`} movie={m} index={i} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
      <Attribution />
    </div>
  );
}
