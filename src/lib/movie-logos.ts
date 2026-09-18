export type OfficialMovieLogo = {
  tmdb_id?: number;
  logo_url?: string | null;
};

const LOGO_API = "https://logo-movies.space-z.ai/api/logo";

export async function getOfficialMovieLogo(tmdbId: number): Promise<string | null> {
  try {
    const response = await fetch(`${LOGO_API}/${tmdbId}`);
    if (!response.ok) return null;
    const data = (await response.json()) as OfficialMovieLogo;
    return typeof data.logo_url === "string" && data.logo_url.trim() ? data.logo_url : null;
  } catch {
    return null;
  }
}
