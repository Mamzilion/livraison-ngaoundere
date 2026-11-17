import Link from "next/link";
import { LangSwitch } from "@/components/i18n";
import { Logo } from "@/components/ui";
import { getLang, getT } from "@/lib/i18n-server";
import { TERMS_SECTIONS, TERMS_SUMMARY, TERMS_VERSION } from "@/lib/terms";

export const metadata = { title: "Conditions de service" };

export default async function TermsPage() {
  const t = await getT();
  const lang = await getLang();
  return (
    <main className="mx-auto max-w-2xl px-4 pb-20 pt-6">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/"><Logo /></Link>
        <LangSwitch />
      </div>
      <h1 className="display text-4xl">{t("terms.title")}</h1>
      <p className="mt-2 font-mono text-xs text-muted">
        {lang === "ff" ? t("terms.ffNote", { v: TERMS_VERSION }) : `Version du ${TERMS_VERSION.split("-").reverse().join("/")}`}
      </p>

      <div className="card mt-6 space-y-2 bg-brand-50">
        <h2 className="display text-xl">{t("m.termsTitle")}</h2>
        <ul className="space-y-1.5 text-sm">
          {TERMS_SUMMARY.map((s) => (
            <li key={s} className="flex gap-2"><span className="text-brand-600">✦</span>{s}</li>
          ))}
        </ul>
      </div>

      <div className="mt-8 space-y-8">
        {TERMS_SECTIONS.map((sec) => (
          <section key={sec.title}>
            <h2 className="display text-xl">{sec.title}</h2>
            <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-ink/85">
              {sec.items.map((it) => (
                <li key={it} className="border-l-2 border-line pl-3">{it}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
