"use client";

import { useState } from "react";
import { WEIGHT, computePrice, weightSupplement } from "@/lib/pricing";
import { useT } from "./i18n";

/** Calculateur de prix interactif (curseur de distance + options). */
export function PriceCalculator() {
  const t = useT();
  const [km, setKm] = useState(5);
  const [kg, setKg] = useState(3);
  const [night, setNight] = useState(false);
  const price = computePrice(km, { weightKg: kg, night });
  const extra = weightSupplement(kg);
  const kgPct = (kg / WEIGHT.maxKg) * 100;
  const pct = ((km - 1) / (20 - 1)) * 100;

  return (
    <div className="card grid gap-6 p-6 sm:p-8 md:grid-cols-[1.4fr_1fr] md:items-center">
      <div className="space-y-6">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="eyebrow">{t("home.priceDistance")}</span>
            <span className="display text-3xl">{km} km</span>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            step={0.5}
            value={km}
            onChange={(e) => setKm(Number(e.target.value))}
            className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full accent-brand-600"
            style={{ background: `linear-gradient(90deg, var(--color-brand-600) ${pct}%, var(--color-line) ${pct}%)` }}
            aria-label={t("home.priceDistance")}
          />
          <div className="mt-2 flex justify-between font-mono text-[11px] text-muted">
            <span>1 km</span>
            <span>Dang ≈ 12–15 km</span>
            <span>20 km</span>
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <span className="eyebrow">{t("home.priceWeight")}</span>
            <span className="display text-2xl">
              {kg} kg {extra > 0 && <span className="text-base text-brand-700">+{extra} F</span>}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={WEIGHT.maxKg}
            step={1}
            value={kg}
            onChange={(e) => setKg(Number(e.target.value))}
            className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full accent-brand-600"
            style={{ background: `linear-gradient(90deg, var(--color-brand-600) ${kgPct}%, var(--color-line) ${kgPct}%)` }}
            aria-label={t("home.priceWeight")}
          />
          <div className="mt-2 flex justify-between font-mono text-[11px] text-muted">
            <span>0 kg</span>
            <span>≤ {WEIGHT.includedKg} kg : 0 F</span>
            <span>{WEIGHT.maxKg} kg</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { on: night, set: setNight, label: `${t("home.priceNight")} +200` },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              onClick={() => o.set(!o.on)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                o.on ? "border-ink bg-ink text-cream" : "border-line bg-cream text-ink hover:border-ink/40"
              }`}
              aria-pressed={o.on}
            >
              {o.on ? "✓ " : ""}
              {o.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted">{t("home.priceFormula")}</p>
      </div>
      <div className="rounded-3xl bg-forest p-6 text-center text-white">
        <div className="eyebrow !text-white/60">{t("home.priceTotal")}</div>
        <div key={price} className="display mt-2 animate-pop text-5xl text-brand-500">
          {new Intl.NumberFormat("fr-FR").format(price).replace(/ | /g, " ")}
        </div>
        <div className="mt-1 font-mono text-sm text-white/70">FCFA</div>
      </div>
    </div>
  );
}

/** Accordéon de questions. */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 py-5 text-left font-display text-lg font-semibold sm:text-xl"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
            >
              {it.q}
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-xl transition duration-300 ${
                  isOpen ? "rotate-45 border-brand-600 bg-brand-600 text-white" : ""
                }`}
              >
                +
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
              <p className="overflow-hidden text-muted">{it.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
