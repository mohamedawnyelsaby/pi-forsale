import { cookies } from "next/headers";

export type Theme = "light" | "dark";
export const THEME_COOKIE = "theme";

/** Returns the user's saved theme, or null to let the browser follow system preference. */
export async function getTheme(): Promise<Theme | null> {
  const value = (await cookies()).get(THEME_COOKIE)?.value;
  return value === "light" || value === "dark" ? value : null;
}
