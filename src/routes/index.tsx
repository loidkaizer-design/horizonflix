import { createFileRoute, redirect } from "@tanstack/react-router";
import { generateUserId } from "@/lib/fandomhub";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HorizonFlix — Find Your Next Favorite" },
      { name: "description", content: "Browse, watch, and talk about the movies you love." },
    ],
  }),
  beforeLoad: async () => {
    if (typeof window !== "undefined" && !localStorage.getItem("horizonflix-user-id")) {
      try {
        const result = await generateUserId();
        localStorage.setItem(
          "horizonflix-user-id",
          result.userId ?? result.id ?? `hrfx${Math.floor(Math.random() * 900000 + 100000)}`,
        );
      } catch {
        localStorage.setItem(
          "horizonflix-user-id",
          `hrfx${Math.floor(Math.random() * 900000 + 100000)}`,
        );
      }
    }
    throw redirect({ to: "/home" });
  },
});
