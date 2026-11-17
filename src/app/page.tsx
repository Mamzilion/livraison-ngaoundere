import Link from "next/link";
import { Faq, PriceCalculator } from "@/components/landing";
import { LangSwitch } from "@/components/i18n";
import { CountUp, Marquee, Reveal } from "@/components/motion";
import { Logo } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import { homeFor } from "@/lib/session";

function SectionHead({ n, label, title, dark = false }: { n: string; label: string; title: string; dark?: boolean }) {
  return (
    <Reveal className="max-w-3xl">
      <p className={`eyebrow ${dark ? "!text-white/60" : ""}`}>
        <span className="text-brand-600">({n})</span> {label}
      </p>
      <h2 className={`display mt-4 text-4xl leading-[1.05] sm:text-5xl ${dark ? "text-white" : ""}`}>{title}</h2>
    </Reveal>
  );
}

/** Aperçu animé de l'application, dans le style d'un téléphone. */
function PhonePreview({ t }: { t: Awaited<ReturnType<typeof getT>> }) {
  const steps = [
    t("status.WAITING_LOCATION"),
    t("status.ASSIGNED"),
    t("status.PICKED_UP"),
    t("status.DELIVERED"),
  ];
  return (
    <div className="relative mx-auto w-full max-w-sm animate-fade-up [animation-delay:200ms]">
      <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-brand-100 via-cream to-transparent blur-2xl" />
      <div className="rounded-[2.5rem] border border-line bg-paper px-5 pb-14 pt-12 shadow-[0_40px_80px_-40px_rgba(26,23,20,0.45)]">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-muted">NG-PW9H</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <span className="pulse-dot text-brand-600" /> {t("status.ASSIGNED")}
          </span>
        </div>
        <div className="display mt-3 text-2xl">Hamadou</div>
        <div className="text-sm text-muted">Bini · 1 paire de chaussures</div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-cream p-3">
            <div className="eyebrow">{t("m.distance")}</div>
            <div className="display mt-1 text-xl">5,6 km</div>
          </div>
          <div className="rounded-2xl bg-forest p-3 text-white">
            <div className="eyebrow !text-white/60">{t("m.price")}</div>
            <div className="display mt-1 text-xl text-brand-500">750 F</div>
          </div>
        </div>
        <ol className="mt-5 space-y-3">
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                  i < 2 ? "bg-brand-600 text-white" : "border border-line text-muted"
                }`}
              >
                {i < 2 ? "✓" : i + 1}
              </span>
              <span className={i < 2 ? "font-medium" : "text-muted"}>{s}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="absolute -top-6 left-4 animate-float rounded-2xl border border-line bg-paper px-4 py-2.5 shadow-lg sm:-left-8">
        <div className="eyebrow">GPS</div>
        <div className="text-sm font-semibold">📍 {t("home.badgeGps")}</div>
      </div>
      <div className="absolute -bottom-5 right-4 animate-float rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg [animation-delay:1.5s] sm:-right-8">
        {t("home.badgePaid")} ✓
      </div>
    </div>
  );
}

export default async function Home() {
  const t = await getT();
  const session = await getSession();
  const steps = [1, 2, 3, 4, 5].map((i) => ({
    t: t(`home.step${i}t` as Parameters<typeof t>[0]),
    d: t(`home.step${i}d` as Parameters<typeof t>[0]),
  }));
  const whys = [1, 2, 3, 4].map((i) => ({
    t: t(`home.why${i}t` as Parameters<typeof t>[0]),
    d: t(`home.why${i}d` as Parameters<typeof t>[0]),
  }));
  const faq = [1, 2, 5, 3, 4].map((i) => ({
    q: t(`home.faq${i}q` as Parameters<typeof t>[0]),
    a: t(`home.faq${i}a` as Parameters<typeof t>[0]),
  }));

  return (
    <div className="overflow-x-clip">
      {/* En-tête */}
      <header className="sticky top-0 z-30 border-b border-line/70 bg-cream/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/"><Logo /></Link>
          <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
            <a href="#comment" className="hover:text-ink">{t("home.howLabel")}</a>
            <a href="#tarifs" className="hover:text-ink">{t("home.priceLabel")}</a>
            <a href="#faq" className="hover:text-ink">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <LangSwitch />
            {session ? (
              <Link href={homeFor(session.role)} className="btn-primary !px-4 !py-2">{t("nav.mySpace")}</Link>
            ) : (
              <Link href="/connexion" className="btn-primary hidden !px-4 !py-2 sm:inline-flex">{t("common.login")}</Link>
            )}
          </div>
        </div>
      </header>

      {/* Héros */}
      <section className="relative mx-auto grid max-w-6xl gap-12 px-4 pb-14 pt-10 sm:px-6 md:grid-cols-[1.15fr_1fr] md:items-center md:pt-16">
        <div className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[32rem] w-[32rem] rounded-full bg-brand-100/70 blur-3xl" />
        <div>
          <p className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-600" /> {t("home.tag")}
          </p>
          <h1 className="display mt-6 animate-fade-up text-[3.2rem] leading-[0.95] [animation-delay:80ms] sm:text-7xl">
            {t("home.title1")}
            <br />
            <span className="text-brand-600">{t("home.title2")}</span>
          </h1>
          <p className="mt-6 max-w-lg animate-fade-up text-lg text-muted [animation-delay:160ms]">{t("home.subtitle")}</p>
          <div className="mt-8 flex animate-fade-up flex-col gap-3 [animation-delay:240ms] sm:flex-row">
            <Link href="/inscription" className="btn-primary group !py-4">
              {t("home.ctaMerchant")} <span className="transition group-hover:translate-x-1">→</span>
            </Link>
            <Link href={session ? homeFor(session.role) : "/connexion"} className="btn-ghost !py-4">
              {session ? t("nav.mySpace") : t("home.ctaLogin")}
            </Link>
          </div>
        </div>
        <PhonePreview t={t} />
      </section>

      {/* Chiffres */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="grid overflow-hidden rounded-3xl border border-line bg-paper sm:grid-cols-3">
          {[
            { v: <><CountUp to={500} /> F</>, l: t("home.stat1") },
            { v: <><CountUp to={100} /> F</>, l: t("home.stat2") },
            { v: t("home.stat3v"), l: t("home.stat3") },
          ].map((s, i) => (
            <div key={i} className="border-line p-6 sm:border-l sm:first:border-l-0 [&:not(:first-child)]:border-t sm:[&:not(:first-child)]:border-t-0">
              <div className="display text-4xl">{s.v}</div>
              <div className="mt-1 text-sm text-muted">{s.l}</div>
            </div>
          ))}
        </Reveal>
      </section>

      <div className="mt-14">
        <Marquee items={["Dang", "Bini", "Grand marché", "Joli Soir", "Baladji", "Sabongari", "Burkina", "Bamyanga", "Mardock"]} />
      </div>

      {/* Comment ça marche */}
      <section id="comment" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6">
        <SectionHead n="01" label={t("home.howLabel")} title={t("home.howTitle")} />
        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s, i) => (
            <Reveal as="li" key={i} delay={i * 90} className="card card-hover">
              <div className="font-mono text-xs text-brand-600">0{i + 1}/05</div>
              <div className="display mt-6 text-xl leading-tight">{s.t}</div>
              <p className="mt-2 text-sm text-muted">{s.d}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Pourquoi Babana — section sombre */}
      <section className="bg-forest py-24 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHead n="02" label={t("home.whyLabel")} title={t("home.whyTitle")} dark />
          <div className="mt-12 grid overflow-hidden rounded-3xl border border-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {whys.map((w, i) => (
              <Reveal
                key={i}
                delay={i * 90}
                className="border-white/10 p-6 transition hover:bg-forest-2 sm:border-l sm:first:border-l-0 [&:not(:first-child)]:border-t sm:[&:not(:first-child)]:border-t-0"
              >
                <div className="font-mono text-xs text-brand-500">0{i + 1}</div>
                <div className="display mt-6 text-xl">{w.t}</div>
                <p className="mt-2 text-sm text-white/65">{w.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section id="tarifs" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6">
        <SectionHead n="03" label={t("home.priceLabel")} title={t("home.priceTitle")} />
        <Reveal className="mt-10">
          <PriceCalculator />
        </Reveal>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto grid max-w-6xl scroll-mt-24 gap-10 px-4 pb-24 sm:px-6 md:grid-cols-[1fr_1.5fr]">
        <SectionHead n="04" label={t("home.faqLabel")} title={t("home.faqTitle")} />
        <Reveal delay={100}>
          <Faq items={faq} />
        </Reveal>
      </section>

      {/* Appel à l'action */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-brand-600 px-6 py-14 text-white sm:px-12">
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full border-[28px] border-white/15" />
          <div className="absolute -bottom-8 right-24 h-24 w-24 rounded-full border-[14px] border-white/10" />
          <h2 className="display relative max-w-xl text-4xl leading-[1.05] sm:text-5xl">{t("home.ctaTitle")}</h2>
          <p className="relative mt-4 max-w-md text-white/85">{t("home.ctaText")}</p>
          <Link href="/inscription" className="btn-dark group relative mt-8 !py-4">
            {t("home.ctaMerchant")} <span className="transition group-hover:translate-x-1">→</span>
          </Link>
        </Reveal>
      </section>

      <footer className="bg-ink text-cream">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <Logo dark />
            <p className="mt-3 max-w-xs text-sm text-cream/60">{t("home.footer")}</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-cream/60">
            <LangSwitch dark />
            <span>© {new Date().getFullYear()} Babana</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
