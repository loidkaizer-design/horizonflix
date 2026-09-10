import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Send, Trash2, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { deleteComment, fetchComments, postComment } from "@/lib/account";

export function Comments({ tmdbId }: { tmdbId: number | string }) {
  const movieId = Number(tmdbId);
  const { user } = useAuth();
  const client = useQueryClient();
  const [text, setText] = useState("");
  const queryKey = ["comments", movieId];

  const query = useQuery({ queryKey, queryFn: () => fetchComments(movieId) });

  const submit = useMutation({
    mutationFn: () => postComment(movieId, user!.id, text.trim()),
    onSuccess: () => {
      setText("");
      client.invalidateQueries({ queryKey });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteComment(id),
    onSuccess: () => client.invalidateQueries({ queryKey }),
  });

  const comments = query.data ?? [];

  return (
    <section className="mt-14 max-w-3xl" aria-labelledby="comments-title">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.25em] text-accent uppercase">
            Community room
          </p>
          <h2 id="comments-title" className="mt-2 text-2xl font-extrabold">
            Talk about this movie
          </h2>
        </div>
        <span className="text-sm text-muted-foreground">{comments.length} comments</span>
      </div>

      {user ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (text.trim()) submit.mutate();
          }}
          className="glass mt-5 rounded-2xl p-4"
        >
          <div className="flex gap-3">
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Add your take..."
              rows={3}
              maxLength={1000}
              className="min-w-0 flex-1 resize-none bg-transparent text-sm outline-none"
            />
            <button
              type="submit"
              disabled={!text.trim() || submit.isPending}
              aria-label="Post comment"
              className="gradient-violet self-end rounded-full p-3 text-primary-foreground transition-transform duration-300 hover:scale-110 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="glass mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
          <p className="text-sm text-muted-foreground">
            Create a free account to join the conversation.
          </p>
          <Link
            to="/auth"
            className="gradient-violet rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform duration-300 hover:scale-105"
          >
            Sign in to comment
          </Link>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {query.isLoading && (
          <p className="text-sm text-muted-foreground">Loading the conversation...</p>
        )}
        {!query.isLoading && !comments.length && (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Be the first person to share a thought.
          </p>
        )}
        {comments.map((comment) => (
          <article
            key={comment.id}
            className="animate-rise rounded-2xl border border-border/70 bg-card/60 p-4 transition-colors hover:border-accent/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 gap-3">
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border bg-secondary/60">
                  {comment.author?.avatar_url ? (
                    <img
                      src={comment.author.avatar_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound className="m-2 h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-accent">
                    {comment.author?.display_name ?? "Viewer"}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed break-words">{comment.content}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
                {user?.id === comment.user_id && (
                  <button
                    onClick={() => remove.mutate(comment.id)}
                    aria-label="Delete comment"
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
