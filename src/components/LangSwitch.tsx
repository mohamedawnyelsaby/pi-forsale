"use client";

import { useRouter } from "next/navigation";

export function LangSwitch({ current, label }: { current: "ar" | "en"; label: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="btn btn-link"
      onClick={() => {
        document.cookie = `lang=${current === "ar" ? "en" : "ar"}; path=/; max-age=31536000; samesite=lax`;
        router.refresh();
      }}
    >
      {label}
    </button>
  );
}
