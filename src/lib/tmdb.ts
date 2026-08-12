const TMDB_KEY = "e55425032d3d0f371fc776f302e7c09b";
const BASE = "https://api.themoviedb.org/3";

export const img = (path: string | null | undefined, size = "w500") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

export type Movie = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  media_type?: string;
};

async function tmdb<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(BASE + path);
  url.searchParams.set("api_key", TMDB_KEY);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB request failed (${res.status})`);
  return (await res.json()) as T;
}

export const getTrending = () =>
  tmdb<{ results: Movie[] }>("/trending/movie/week").then((d) => d.results);

export const getByGenre = (genreId: number) =>
  tmdb<{ results: Movie[] }>("/discover/movie", {
    with_genres: String(genreId),
    sort_by: "popularity.desc",
  }).then((d) => d.results);

export const getList = (list: string) =>
  tmdb<{ results: Movie[] }>(`/movie/${list}`).then((d) => d.results);

export const searchMovies = (query: string) =>
  tmdb<{ results: Movie[] }>("/search/movie", { query }).then((d) => d.results);

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
  tmdb<MovieDetail>(`/movie/${id}`, {
    append_to_response: "credits,images,similar",
  });

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

export const getPerson = (id: string | number) =>
  tmdb<Person>(`/person/${id}`, { append_to_response: "movie_credits" });

export const playerUrl = (id: string | number) => `https://111movies.net/movie/${id}`;
export const tvPlayerUrl = (id: string | number, season: number, episode: number) =>
  `https://111movies.net/tv/${id}/${season}/${episode}`;

export const year = (m: Movie) => (m.release_date || m.first_air_date || "").slice(0, 4);
export const titleOf = (m: Movie) => m.title || m.name || "Untitled";
