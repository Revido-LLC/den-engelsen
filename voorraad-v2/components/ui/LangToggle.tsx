"use client";
import { useLang, Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center bg-secondary rounded-lg p-0.5 gap-0.5">
      {(["en", "nl"] as Language[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={cn(
            "px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150 uppercase tracking-wide",
            lang === l
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
