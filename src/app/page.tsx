import Link from "next/link";
import { Logo } from "@/components/ui";
import { PRICING, computePrice } from "@/lib/pricing";
import { fcfa } from "@/lib/format";

const steps = [
  { t: "Vous créez la course", d: "Nom et numéro du client, colis, montant à encaisser. 30 secondes." },
  { t: "Le client partage sa position", d: "Il reçoit un lien, appuie sur un bouton : son GPS est enregistré." },
  { t: "Le prix est calculé", d: "Selon la distance, automatiquement. Pas de négociation." },
  { t: "Notre livreur livre", d: "Il récupère le colis chez vous et le remet au client." },
  { t: "Vous êtes payé le soir", d: "L'argent encaissé vous est reversé par MoMo ou OM, le jour même." },
];

export default function Home() {
  const examples = [2, 5, 8, 12, 15];
  return (
    <div>
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Logo className="text-brand-800" />
        <Link href="/connexion" className="text-sm font-semibold text-brand-800">Se connecter</Link>
      </header>

      <section className="mx-auto max-w-5xl px-4 pb-10 pt-6">
        <div className="rounded-3xl bg-brand-800 px-6 py-10 text-white sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-400">Ngaoundéré · Dang · Bini</p>
          <h1 className="mt-3 max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl">
            Vos livraisons, sans stress, le jour même.
          </h1>
          <p className="mt-3 max-w-xl text-brand-100">
            Boutiques, vendeurs en ligne, restaurants : vous vendez, on livre. Suivi en direct, prix fixe selon la
            distance et argent reversé chaque soir.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/inscription" className="btn-accent">Créer mon compte commerçant</Link>
            <Link href="/connexion" className="btn border border-white/30 text-white hover:bg-white/10">J&apos;ai déjà un compte</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-10">
        <h2 className="text-xl font-bold">Comment ça marche</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s, i) => (
            <li key={s.t} className="card">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-800">{i + 1}</div>
              <div className="mt-3 font-semibold">{s.t}</div>
              <div className="mt-1 text-sm text-stone-600">{s.d}</div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <h2 className="text-xl font-bold">Nos tarifs</h2>
        <p className="mt-1 text-sm text-stone-600">
          {PRICING.base} FCFA de prise en charge + {PRICING.perKm} FCFA par km, minimum {PRICING.minimum} FCFA.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {examples.map((km) => (
            <div key={km} className="card text-center">
              <div className="text-sm text-stone-500">{km} km</div>
              <div className="text-lg font-bold text-brand-800">{fcfa(computePrice(km))}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-stone-500">
          Suppléments : +{PRICING.heavySupplement} FCFA colis lourd, +{PRICING.nightSupplement} FCFA après {PRICING.nightStartHour} h.
          Packs mensuels avec réduction pour les commerces réguliers.
        </p>
      </section>
    </div>
  );
}
