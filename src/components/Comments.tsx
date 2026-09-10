import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Flag, Heart, ImagePlus, MessageCircle, Send, X } from "lucide-react";
import {
  createComment,
  getComments,
  likeComment,
  reportComment,
  replyToComment,
  toDataUrl,
  type Comment,
} from "@/lib/fandomhub";

const USER_KEY = "horizonflix-user-id";
const getUserId = () =>
  typeof window === "undefined" ? "guest" : (localStorage.getItem(USER_KEY) ?? "guest");

export function Comments({ tmdbId }: { tmdbId: number | string }) {
  const userId = getUserId();
  const client = useQueryClient();
  const [text, setText] = useState("");
  const [reply, setReply] = useState<Comment | null>(null);
  const [media, setMedia] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryKey = ["comments", tmdbId, userId];
  const query = useQuery({ queryKey, queryFn: () => getComments(tmdbId, userId) });
  const submit = useMutation({
    mutationFn: () =>
      reply
        ? replyToComment(tmdbId, userId, reply.id, text.trim(), media)
        : createComment(tmdbId, userId, text.trim(), null, media),
    onSuccess: () => {
      setText("");
      setReply(null);
      setMedia(null);
      client.invalidateQueries({ queryKey });
    },
  });
  const action = (fn: () => Promise<unknown>) => {
    fn()
      .then(() => client.invalidateQueries({ queryKey }))
      .catch(() => undefined);
  };
  const comments = query.data ?? [];
  const roots = comments.filter((comment) => comment.parentId == null);
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
            placeholder={reply ? `Reply to ${reply.userId}` : "Add your take..."}
            rows={3}
            className="min-w-0 flex-1 resize-none bg-transparent text-sm outline-none"
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={!text.trim() || submit.isPending}
            aria-label="Post comment"
            className="gradient-violet self-end rounded-full p-3 text-primary-foreground disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <input
            ref={fileRef}
            type="file"
            accept="image/*,.gif"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (file) setMedia(await toDataUrl(file));
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 hover:text-accent"
          >
            <ImagePlus className="h-4 w-4" /> Add image/GIF
          </button>
          {media && (
            <button
              type="button"
              onClick={() => setMedia(null)}
              className="inline-flex items-center gap-1 text-accent"
            >
              Media attached <X className="h-3 w-3" />
            </button>
          )}
          {reply && (
            <button
              type="button"
              onClick={() => setReply(null)}
              className="ml-auto hover:text-accent"
            >
              Cancel reply
            </button>
          )}
        </div>
        {media && (
          <img
            src={media}
            alt="Attached preview"
            className="mt-3 max-h-32 rounded-lg object-cover"
          />
        )}
      </form>
      <div className="mt-6 flex flex-col gap-4">
        {query.isLoading && (
          <p className="text-sm text-muted-foreground">Loading the conversation...</p>
        )}
        {!query.isLoading && !roots.length && (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Be the first person to share a thought.
          </p>
        )}
        {roots.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            all={comments}
            onReply={setReply}
            onLike={() => action(() => likeComment(tmdbId, userId, comment.id))}
            onReport={() => action(() => reportComment(tmdbId, userId, comment.id))}
          />
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Attached media is stored by the community API for 24 hours. Reported comments are hidden
        after three reports.
      </p>
    </section>
  );
}

function CommentItem({
  comment,
  all,
  onReply,
  onLike,
  onReport,
}: {
  comment: Comment;
  all: Comment[];
  onReply: (comment: Comment) => void;
  onLike: () => void;
  onReport: () => void;
}) {
  const replies = all.filter((item) => String(item.parentId) === String(comment.id));
  return (
    <article className="rounded-2xl border border-border/70 bg-card/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-accent">{comment.userId}</p>
          <p className="mt-1 text-sm leading-relaxed">{comment.body}</p>
          {comment.mediaUrl && (
            <img
              src={comment.mediaUrl}
              alt="Comment attachment"
              className="mt-3 max-h-56 rounded-xl object-cover"
            />
          )}
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          {new Date(comment.createdAt).toLocaleDateString()}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <button onClick={onLike} className="inline-flex items-center gap-1 hover:text-accent">
          <Heart className="h-3.5 w-3.5" /> {comment.likes}
        </button>
        <button
          onClick={() => onReply(comment)}
          className="inline-flex items-center gap-1 hover:text-accent"
        >
          <MessageCircle className="h-3.5 w-3.5" /> Reply
        </button>
        <button
          onClick={onReport}
          className="ml-auto inline-flex items-center gap-1 hover:text-destructive"
        >
          <Flag className="h-3.5 w-3.5" /> Report
        </button>
      </div>
      {replies.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 border-l border-border pl-4">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              all={all}
              onReply={onReply}
              onLike={onLike}
              onReport={onReport}
            />
          ))}
        </div>
      )}
    </article>
  );
}
