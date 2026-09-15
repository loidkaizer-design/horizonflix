export function Logo({ className = "h-10" }: { className?: string }) {
  return (
    <span
      aria-label="Kanto-Flix"
      className={`${className} inline-flex w-auto items-center font-display text-2xl font-extrabold tracking-[-0.06em] text-foreground transition-transform duration-500 hover:scale-105 sm:text-3xl`}
    >
      <span className="text-primary">Kanto</span>
      <span className="text-accent">-Flix</span>
    </span>
  );
}
