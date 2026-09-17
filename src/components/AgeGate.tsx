import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";

export function AgeGate({
  signedIn,
  verifiedAdult,
}: {
  signedIn: boolean;
  verifiedAdult: boolean;
}) {
  return (
    <section className="mx-auto mt-10 max-w-xl rounded-3xl border border-destructive/40 bg-destructive/5 p-8 text-center shadow-[var(--shadow-card)]">
      <ShieldAlert className="mx-auto size-10 text-destructive" aria-hidden="true" />
      <p className="mt-4 text-xs font-bold tracking-[0.25em] text-destructive uppercase">
        18+ restricted
      </p>
      <h1 className="mt-2 text-2xl font-extrabold">This title is for adults only.</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {signedIn
          ? "Kantoflix needs an account with a verified date of birth showing you are 18 or older before this movie can be watched."
          : "Sign in and verify your date of birth to access adult-rated movies."}
      </p>
      {!signedIn || !verifiedAdult ? (
        <Link
          to={signedIn ? "/profile" : "/auth"}
          className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground transition-transform hover:scale-105"
        >
          {signedIn ? "Verify age in profile" : "Sign in to continue"}
        </Link>
      ) : null}
    </section>
  );
}
