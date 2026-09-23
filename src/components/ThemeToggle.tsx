"use client";

import { useRouter } from "next/navigation";
const THEME_COOKIE = "theme";

export function ThemeToggle({ current, dayLabel, nightLabel }: { current: "light" | "dark" | null; dayLabel: string; nightLabel: string }) {
  const router = useRouter();

  function setTheme(next: "light" | "dark") {
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  const systemPrefersDark =
    typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const effective = current ?? (systemPrefersDark ? "dark" : "light");

  return (
    <button
      type="button"
      className="btn btn-link theme-toggle"
      onClick={() => setTheme(effective === "dark" ? "light" : "dark")}
      aria-label={effective === "dark" ? dayLabel : nightLabel}
      title={effective === "dark" ? dayLabel : nightLabel}
    >
      {effective === "dark" ? "☀" : "☾"}
    </button>
  );
}
