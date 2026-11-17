"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useTransition } from "react";
import { LANG_COOKIE, LANG_LABEL, LANGS, translate, type Lang, type TFn } from "@/lib/i18n";

const LangContext = createContext<Lang>("fr");

export function I18nProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useLang(): Lang {
  return useContext(LangContext);
}

export function useT(): TFn {
  const lang = useLang();
  return (key, vars) => translate(lang, key, vars);
}

/** Bascule Français / Fulfulde, mémorisée dans un cookie pendant un an. */
export function LangSwitch({ dark = false }: { dark?: boolean }) {
  const lang = useLang();
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div
      className={`inline-flex rounded-full p-0.5 text-xs font-semibold ring-1 ${
        dark ? "bg-white/10 ring-white/20" : "bg-white ring-stone-200"
      } ${pending ? "opacity-60" : ""}`}
      role="group"
      aria-label="Langue"
    >
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => {
            document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
            start(() => router.refresh());
          }}
          className={`rounded-full px-2.5 py-1 transition ${
            l === lang
              ? "bg-ink text-cream"
              : dark
                ? "text-white/70 hover:text-white"
                : "text-stone-500 hover:text-stone-900"
          }`}
          aria-pressed={l === lang}
        >
          {l === "fr" ? "FR" : "Fulfulde"}
          <span className="sr-only"> {LANG_LABEL[l]}</span>
        </button>
      ))}
    </div>
  );
}
