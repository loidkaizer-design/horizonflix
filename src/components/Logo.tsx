export function Logo({ className = "h-10" }: { className?: string }) {
  return (
    <span
      aria-label="Kantoflix"
      className={`${className} inline-flex w-auto items-center transition-transform duration-500 hover:scale-105`}
    >
      <img src="/kantoflix.png" alt="Kantoflix" className="h-full w-auto object-contain" />
    </span>
  );
}
