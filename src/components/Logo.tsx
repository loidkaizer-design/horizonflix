export function Logo({ className = "h-10" }: { className?: string }) {
  return (
    <img
      src="/horizonflix-logo.png"
      alt="HorizonFlix"
      className={`${className} w-auto object-contain transition-transform duration-500 hover:scale-105`}
    />
  );
}
