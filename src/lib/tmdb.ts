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

const dedupe = (movies: Movie[]) => {
  const seen = new Set<number>();
  return movies.filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)));
};

const pages = async (loader: (page: number) => Promise<Movie[]>, count = 3) =>
  dedupe((await Promise.all(Array.from({ length: count }, (_, i) => loader(i + 1)))).flat());

export const getByGenre = (genreId: number) =>
  pages((page) =>
    tmdb<{ results: Movie[] }>("/discover/movie", {
      with_genres: String(genreId),
      sort_by: "popularity.desc",
      page: String(page),
    }).then((d) => d.results),
  );

export const getList = (list: string) =>
  pages((page) =>
    tmdb<{ results: Movie[] }>(`/movie/${list}`, { page: String(page) }).then((d) => d.results),
  );

export const GENRES: { id: number; name: string }[] = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

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

const VIDLINK_PARAMS = {
  primaryColor: "7C3AED",
  secondaryColor: "2E1065",
  icons: "vid",
  iconColor: "FFFFFF",
  title: "true",
  poster: "true",
  autoplay: "false",
};

const vidlinkUrl = (path: string, extra: Record<string, string> = {}) => {
  const params = new URLSearchParams({ ...VIDLINK_PARAMS, ...extra });
  return `https://vidlink.pro${path}?${params.toString()}`;
};

export const playerUrl = (id: string | number) => vidlinkUrl(`/movie/${id}`);
export const tvPlayerUrl = (id: string | number, season: number, episode: number) =>
  vidlinkUrl(`/tv/${id}/${season}/${episode}`, { nextbutton: "true" });

export const year = (m: Movie) => (m.release_date || m.first_air_date || "").slice(0, 4);
export const titleOf = (m: Movie) => m.title || m.name || "Untitled";
