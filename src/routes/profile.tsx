import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Attribution, Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { fetchProfile, fetchWatchlist, saveProfile } from "@/lib/account";
import { img } from "@/lib/tmdb";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — Kanto-Flix" },
      {
        name: "description",
        content: "Update your Kanto-Flix display name and avatar, and review your saved titles.",
      },
      { property: "og:title", content: "Your Profile — Kanto-Flix" },
      {
        property: "og:description",
        content: "Manage your Kanto-Flix account details and saved movies.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

const AVATARS = Array.from(
  { length: 24 },
  (_, i) => `https://api.dicebear.com/9.x/adventurer/svg?seed=horizonflix-${i + 1}`,
);

function ProfilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const client = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const profile = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: Boolean(user),
  });

  useEffect(() => {
    if (profile.data) {
      setDisplayName(profile.data.display_name ?? "");
      setAvatarUrl(profile.data.avatar_url ?? null);
      setBirthDate(
        typeof user?.user_metadata?.birth_date === "string" ? user.user_metadata.birth_date : "",
      );
    }
  }, [profile.data]);

  const watchlist = useQuery({
    queryKey: ["watchlist", user?.id],
    queryFn: fetchWatchlist,
    enabled: Boolean(user),
  });

  const save = useMutation({
    mutationFn: async () => {
      await supabase.auth.updateUser({ data: { birth_date: birthDate } });
      return saveProfile(user!.id, {
        display_name: displayName.trim() || "Viewer",
        avatar_url: avatarUrl,
      });
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ["profile", user?.id] }),
  });

  const saved = watchlist.data ?? [];

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" /> Back to browse
        </Link>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
          <section className="glass animate-rise rounded-3xl p-6 sm:p-8">
            <p className="text-xs font-bold tracking-[0.25em] text-accent uppercase">
              Your profile
            </p>
            <h1 className="mt-2 text-3xl font-extrabold">Make it yours.</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your name and avatar appear next to the comments you post.
            </p>

            <label className="mt-8 block text-sm font-semibold">
              Display name
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Viewer"
                className="mt-2 w-full rounded-xl border border-border bg-secondary/60 px-4 py-3 font-normal outline-none transition-colors focus:border-accent"
              />
            </label>
            <p className="mt-4 text-sm text-muted-foreground">
              Signed in as <span className="text-foreground">{user?.email}</span>
            </p>
            <label className="mt-5 block text-sm font-semibold">
              Date of birth
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="mt-2 w-full rounded-xl border border-border bg-secondary/60 px-4 py-3 font-normal outline-none transition-colors focus:border-accent"
              />
              <span className="mt-2 block text-xs font-normal text-muted-foreground">
                Used only to enforce age ratings. Adult titles require a signed-in account aged 18+.
              </span>
            </label>

            <div className="mt-8">
              <h2 className="text-lg font-bold">Choose an avatar</h2>
              <div className="mt-4 grid grid-cols-5 gap-3 sm:grid-cols-8">
                {AVATARS.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`overflow-hidden rounded-2xl border-2 bg-secondary/60 transition-transform duration-300 hover:scale-110 ${
                      avatarUrl === url ? "border-accent" : "border-transparent"
                    }`}
                  >
                    <img src={url} alt="Avatar option" className="aspect-square w-full" />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => save.mutate()}
              disabled={save.isPending || !user}
              className="gradient-violet mt-8 inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold text-primary-foreground transition-transform duration-300 hover:scale-105 disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {save.isPending ? "Saving..." : "Save profile"}
            </button>
            {save.isSuccess && <p className="mt-3 text-sm text-accent">Profile saved.</p>}
            {save.isError && (
              <p className="mt-3 text-sm text-destructive">We couldn't save that. Try again.</p>
            )}
          </section>

          <aside
            className="glass animate-rise h-fit rounded-3xl p-6"
            style={{ animationDelay: "80ms" }}
          >
            <p className="text-xs font-bold tracking-[0.25em] text-accent uppercase">Watchlist</p>
            <h2 className="mt-2 text-2xl font-extrabold">Saved titles</h2>
            <div className="mt-6 flex flex-col gap-3">
              {!saved.length && (
                <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                  Nothing saved yet.
                </p>
              )}
              {saved.slice(0, 8).map((entry) => (
                <Link
                  key={entry.id}
                  to="/movie/$id"
                  params={{ id: String(entry.movie_id) }}
                  className="flex items-center gap-3 rounded-xl bg-secondary/60 p-2 text-sm transition-colors hover:text-accent"
                >
                  {img(entry.poster_path, "w500") && (
                    <img
                      src={img(entry.poster_path, "w500")!}
                      alt=""
                      loading="lazy"
                      className="h-14 w-10 shrink-0 rounded-md object-cover"
                    />
                  )}
                  <span className="truncate">{entry.title ?? `Movie #${entry.movie_id}`}</span>
                </Link>
              ))}
            </div>
            <Link to="/watchlist" className="mt-5 inline-flex text-sm text-accent hover:underline">
              View full watchlist
            </Link>
          </aside>
        </div>
      </main>
      <Attribution />
    </div>
  );
}
