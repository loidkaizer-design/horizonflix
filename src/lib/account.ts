import { supabase } from "@/integrations/supabase/client";

export type ProfileRow = {
  id: string;
  display_name: string;
  avatar_url: string | null;
};

export type CommentRow = {
  id: string;
  user_id: string;
  movie_id: number;
  content: string;
  created_at: string;
  author: ProfileRow | null;
};

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as ProfileRow | null;
}

export async function saveProfile(userId: string, values: Partial<ProfileRow>) {
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, display_name: values.display_name ?? "Viewer", avatar_url: values.avatar_url ?? null });
  if (error) throw error;
}

export async function fetchComments(movieId: number): Promise<CommentRow[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("id, user_id, movie_id, content, created_at")
    .eq("movie_id", movieId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = data ?? [];
  if (!rows.length) return [];
  const ids = [...new Set(rows.map((r) => r.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", ids);
  const byId = new Map((profiles ?? []).map((p) => [p.id, p as ProfileRow]));
  return rows.map((r) => ({ ...r, author: byId.get(r.user_id) ?? null }));
}

export async function postComment(movieId: number, userId: string, content: string) {
  const { error } = await supabase
    .from("comments")
    .insert({ movie_id: movieId, user_id: userId, content });
  if (error) throw error;
}

export async function deleteComment(id: string) {
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchWatchlist() {
  const { data, error } = await supabase
    .from("watchlist")
    .select("id, movie_id, title, poster_path, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addToWatchlist(entry: {
  userId: string;
  movieId: number;
  title?: string | null;
  posterPath?: string | null;
}) {
  const { error } = await supabase.from("watchlist").insert({
    user_id: entry.userId,
    movie_id: entry.movieId,
    title: entry.title ?? null,
    poster_path: entry.posterPath ?? null,
  });
  if (error) throw error;
}

export async function removeFromWatchlist(movieId: number) {
  const { error } = await supabase.from("watchlist").delete().eq("movie_id", movieId);
  if (error) throw error;
}
