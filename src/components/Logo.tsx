import logo from "@/assets/horizonflix-logo.png.asset.json";

export function Logo({ className = "h-10" }: { className?: string }) {
  return (
    <img
      src={logo.url}
      alt="HorizonFlix"
      className={`${className} w-auto object-contain [filter:invert(1)_hue-rotate(180deg)_brightness(1.6)] mix-blend-screen transition-transform duration-500 hover:scale-105`}
    />
  );
}
