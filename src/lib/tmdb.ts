const BASE = "/api/tmdb";

export const img = (path: string | null | undefined, size = "w500") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

export type Movie = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  popularity?: number;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  media_type?: string;
};

async function tmdb<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const query = new URLSearchParams(params);
  const res = await fetch(`${BASE}${path}${query.size ? `?${query}` : ""}`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(
      `[tmdb] request failed: ${res.status} ${res.statusText} — ${path}?${query} — body: ${text.slice(0, 200)}`,
    );
    throw new Error(`TMDB request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

const pages = async (path: string, params: Record<string, string> = {}, count = 3) =>
  dedupe(
    (
      await Promise.all(
        Array.from({ length: count }, (_, i) =>
          tmdb<{ results: Movie[] }>(path, { ...params, page: String(i + 1) }),
        ),
      )
    ).flatMap((d) => d.results),
  );

export const getTrending = () => pages("/trending/movie/week", {}, 3);
export const getPopular = () => pages("/movie/popular", {}, 3);
export const getLatest = () =>
  pages(
    "/discover/movie",
    {
      sort_by: "primary_release_date.desc",
      "primary_release_date.lte": new Date().toISOString().slice(0, 10),
      "vote_count.gte": "20",
    },
    3,
  );
export const getPinoyMovies = () =>
  pages(
    "/discover/movie",
    { with_origin_country: "PH", sort_by: "popularity.desc", "vote_count.gte": "3" },
    3,
  );
export const getByGenre = (genreId: number) =>
  pages("/discover/movie", { with_genres: String(genreId), sort_by: "popularity.desc" });
export const getList = (list: string) => pages(`/movie/${list}`);
export const searchMovies = (query: string) =>
  tmdb<{ results: Movie[] }>("/search/movie", { query }).then((d) => d.results);

export const GENRES: { id: number; name: string }[] = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 18, name: "Drama" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
];

export type CastMember = {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
};
export type MovieDetail = Movie & {
  runtime: number;
  genres: { id: number; name: string }[];
  tagline: string;
  imdb_id?: string;
  credits: { cast: CastMember[] };
  images: { backdrops: { file_path: string }[]; posters: { file_path: string }[] };
  similar: { results: Movie[] };
};
export const getMovie = (id: string | number) =>
  tmdb<MovieDetail>(`/movie/${id}`, { append_to_response: "credits,images,similar" });
export const getPerson = (id: string | number) =>
  tmdb(`/person/${id}`, { append_to_response: "movie_credits" });
const dedupe = (movies: Movie[]) => {
  const seen = new Set<number>();
  return movies.filter((m) => !seen.has(m.id) && seen.add(m.id));
};
export const dedupeMovieGroups = (groups: Movie[][]) => {
  const seen = new Set<number>();
  return groups.map((group) => group.filter((m) => !seen.has(m.id) && seen.add(m.id)));
};
export const year = (m: Movie) => (m.release_date || m.first_air_date || "").slice(0, 4);
export const titleOf = (m: Movie) => m.title || m.name || "Untitled";
export const playerUrl = (id: string | number) => `https://apiplayer.ru/embed/movie/${id}?lang=en`;
export const tvPlayerUrl = (id: string | number, season: number, episode: number) =>
  `https://apiplayer.ru/embed/tv/${id}/${season}/${episode}?lang=en`;
export const getDivineTrailerUrl = async () => null;
export type Person = {
  id: number;
  name: string;
  biography: string;
  profile_path: string | null;
  known_for_department: string;
  birthday: string | null;
  place_of_birth: string | null;
  movie_credits: { cast: Movie[] };
};
