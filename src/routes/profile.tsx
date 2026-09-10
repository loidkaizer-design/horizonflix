import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Attribution, Navigation } from "@/components/Navigation";
import {
  createProfile,
  generateUserId,
  getAvatars,
  getProfile,
  getWatchHistory,
  updateProfile,
  type Avatar,
  type Profile,
} from "@/lib/fandomhub";

export const Route = createFileRoute("/profile")({ component: ProfilePage });
const USER_KEY = "horizonflix-user-id";
const fallback: Profile = {
  userId: "",
  displayName: "Movie lover",
  username: "movie-lover",
  description: "Here for the stories.",
  profilePicture: "",
};

function ProfilePage() {
  const client = useQueryClient();
  const [profile, setProfile] = useState<Profile>(fallback);
  const [userId, setUserId] = useState("");
  useEffect(() => {
    let id = localStorage.getItem(USER_KEY);
    const setup = async () => {
      if (!id) {
        const result = await generateUserId();
        id = result.userId ?? result.id ?? `hrfx${Math.floor(Math.random() * 900000 + 100000)}`;
        localStorage.setItem(USER_KEY, id);
      }
      setUserId(id);
      try {
        const existing = await getProfile(id);
        setProfile(existing);
      } catch {
        const initial = { ...fallback, userId: id };
        setProfile(initial);
        await createProfile(initial).catch(() => undefined);
      }
    };
    void setup();
  }, []);
  const avatars = useQuery({ queryKey: ["avatars"], queryFn: getAvatars });
  const history = useQuery({
    queryKey: ["watch-history", userId],
    queryFn: () => getWatchHistory(userId),
    enabled: Boolean(userId),
  });
  const save = useMutation({
    mutationFn: () => updateProfile(profile),
    onSuccess: (saved) => {
      setProfile(saved);
      client.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" /> Back to browse
        </Link>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
          <section className="glass rounded-3xl p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-[0.25em] text-accent uppercase">
                  Your profile
                </p>
                <h1 className="mt-2 text-3xl font-extrabold">Make it yours.</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your User ID is permanent and powers your watch history.
                </p>
              </div>
              <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-xs text-accent">
                {userId || "Generating..."}
              </span>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                Display name
                <input
                  value={profile.displayName}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-border bg-secondary/60 px-4 py-3 font-normal outline-none focus:border-accent"
                />
              </label>
              <label className="text-sm font-semibold">
                Username
                <input
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-border bg-secondary/60 px-4 py-3 font-normal outline-none focus:border-accent"
                />
              </label>
              <label className="text-sm font-semibold sm:col-span-2">
                Description
                <textarea
                  value={profile.description}
                  onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                  rows={3}
                  className="mt-2 w-full resize-none rounded-xl border border-border bg-secondary/60 px-4 py-3 font-normal outline-none focus:border-accent"
                />
              </label>
            </div>
            <button
              onClick={() => save.mutate()}
              disabled={save.isPending || !userId}
              className="gradient-violet mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold text-primary-foreground disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> Save profile
            </button>
            <div className="mt-10">
              <h2 className="text-lg font-bold">Choose an avatar</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                35 built-in choices: 15 male, 15 female, and 5 random.
              </p>
              <div className="mt-4 grid grid-cols-5 gap-3 sm:grid-cols-7">
                {(avatars.data ?? []).map((avatar: Avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setProfile({ ...profile, profilePicture: avatar.url })}
                    className={`overflow-hidden rounded-2xl border-2 transition-transform hover:scale-105 ${profile.profilePicture === avatar.url ? "border-accent" : "border-transparent"}`}
                  >
                    <img
                      src={avatar.url}
                      alt={avatar.name ?? `Avatar ${avatar.id}`}
                      className="aspect-square w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>
          <aside className="glass h-fit rounded-3xl p-6">
            <p className="text-xs font-bold tracking-[0.25em] text-accent uppercase">
              Watch history
            </p>
            <h2 className="mt-2 text-2xl font-extrabold">Your journey</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Movies you watch are attached to your immutable User ID.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {history.isLoading && (
                <p className="text-sm text-muted-foreground">Loading history...</p>
              )}
              {!history.isLoading && !history.data?.length && (
                <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                  Start watching to build your history.
                </p>
              )}
              {history.data?.map((entry) => (
                <div
                  key={entry.id ?? entry.tmdbId}
                  className="rounded-xl bg-secondary/60 px-3 py-2 text-sm"
                >
                  Movie #{entry.tmdbId}
                  <span className="block text-xs text-muted-foreground">
                    {new Date(entry.watchedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
      <Attribution />
    </div>
  );
}
