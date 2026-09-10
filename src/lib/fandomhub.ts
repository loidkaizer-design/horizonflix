const API_BASE = "https://fandomhub-mebcgquh.manus.space";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!response.ok) throw new Error(`FandomHub request failed (${response.status})`);
  return (await response.json()) as T;
}

export type MovieLogo = {
  url?: string;
  logoUrl?: string;
  filePath?: string;
  language?: string | null;
  preferred?: boolean;
};
export type Comment = {
  id: number | string;
  userId: string;
  body: string;
  parentId: number | string | null;
  likes: number;
  mediaUrl?: string | null;
  status: string;
  createdAt: string;
};
export type Profile = {
  userId: string;
  displayName: string;
  username: string;
  description: string;
  profilePicture: string;
};
export type Avatar = {
  id: string;
  name?: string;
  url: string;
  gender?: "male" | "female" | "random";
};
export type WatchHistory = {
  id?: number | string;
  userId: string;
  tmdbId: number;
  watchedAt: string;
  progress?: number;
};

export const getMovieLogos = async (tmdbId: number | string) => {
  const data = await request<unknown>(`/logo/movie/${tmdbId}`);
  if (Array.isArray(data)) return data as MovieLogo[];
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const variants = record.logos ?? record.variants ?? record.data;
    if (Array.isArray(variants)) return variants as MovieLogo[];
  }
  return [];
};

export const getComments = async (tmdbId: number | string, userId: string) => {
  const data = await request<{ comments?: Comment[] }>(
    `/comment/${tmdbId}/${encodeURIComponent(userId)}`,
  );
  return data.comments ?? [];
};

export const createComment = (
  tmdbId: number | string,
  userId: string,
  body: string,
  parentId?: number | string | null,
  mediaUrl?: string | null,
) =>
  request<Comment>(`/comment/${tmdbId}/${encodeURIComponent(userId)}`, {
    method: "POST",
    body: JSON.stringify({
      body,
      text: body,
      parentId: parentId ?? null,
      mediaUrl: mediaUrl ?? null,
    }),
  });
export const replyToComment = (
  tmdbId: number | string,
  userId: string,
  commentId: number | string,
  body: string,
  mediaUrl?: string | null,
) =>
  request<Comment>(`/comment/${tmdbId}/${encodeURIComponent(userId)}/${commentId}/reply`, {
    method: "POST",
    body: JSON.stringify({ body, text: body, mediaUrl: mediaUrl ?? null }),
  });
export const likeComment = (tmdbId: number | string, userId: string, commentId: number | string) =>
  request<unknown>(`/comment/${tmdbId}/${encodeURIComponent(userId)}/${commentId}/like`, {
    method: "POST",
  });
export const reportComment = (
  tmdbId: number | string,
  userId: string,
  commentId: number | string,
) =>
  request<unknown>(`/comment/${tmdbId}/${encodeURIComponent(userId)}/${commentId}/report`, {
    method: "POST",
  });

export const getAvatars = () => request<Avatar[]>("/avatars");
export const generateUserId = () =>
  request<{ userId: string; id?: string }>("/generate-userid", { method: "POST", body: "{}" });
export const getProfile = (userId: string) =>
  request<Profile>(`/profile/${encodeURIComponent(userId)}`);
export const createProfile = (profile: Profile) =>
  request<Profile>("/profile", { method: "POST", body: JSON.stringify(profile) });
export const updateProfile = (profile: Partial<Profile> & { userId: string }) =>
  request<Profile>(`/profile/${encodeURIComponent(profile.userId)}`, {
    method: "PATCH",
    body: JSON.stringify(profile),
  });
export const getWatchHistory = (userId: string) =>
  request<WatchHistory[]>(`/watch-history?user_id=${encodeURIComponent(userId)}`);
export const recordWatch = (entry: WatchHistory) =>
  request<WatchHistory>("/watch-history", { method: "POST", body: JSON.stringify(entry) });

export const preferredLogoUrl = (logo: MovieLogo) =>
  logo.url ?? logo.logoUrl ?? logo.filePath ?? null;
export const toDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export { API_BASE };
