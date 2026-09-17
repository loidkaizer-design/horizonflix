import type { User } from "@supabase/supabase-js";
import type { Movie } from "@/lib/tmdb";

export type AgeRating = "E" | "18+";

export function ageRating(movie: Movie): AgeRating {
  return movie.adult ? "18+" : "E";
}

export function isAdult(user: User | null | undefined): boolean {
  const birthDate = user?.user_metadata?.birth_date;
  if (typeof birthDate !== "string") return false;
  const birth = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return false;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 18;
}

export function ageLabelClass(rating: AgeRating) {
  return rating === "18+"
    ? "border-destructive/60 bg-destructive text-destructive-foreground"
    : "border-accent/50 bg-accent text-accent-foreground";
}
