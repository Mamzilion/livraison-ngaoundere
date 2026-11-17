import { driverUpdateStatus } from "@/app/actions/driver";
import { AutoRefresh, SubmitButton } from "@/components/client";
import { AppHeader, Page, Stat, StatusBadge } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { and, asc, eq, gte, inArray } from "drizzle-orm";
import { db, deliveries } from "@/lib/db";
import { directionsLink, displayPhone, fcfa } from "@/lib/format";

export const metadata = { title: "Mes courses" };

export default async function DriverPage() {
  const me = await requireUser("DRIVER");
  const [active, doneToday] = await Promise.all([
    db.query.deliveries.findMany({
      where: and(eq(deliveries.driverId, me.id), inArray(deliveries.status, ["ASSIGNED", "PICKED_UP"])),
      with: { merchant: true },
      orderBy: asc(deliveries.assignedAt),
    }),
    db.query.deliveries.findMany({
      where: and(
        eq(deliveries.driverId, me.id),
        eq(deliveries.status, "DELIVERED"),
        gte(deliveries.deliveredAt, new Date(Date.now() - 24 * 3600 * 1000)),
      ),
    }),
  ]);
  const cashToday = doneToday.reduce((s, d) => s + d.amountToCollect, 0);

  return (
    <>
      <AppHeader title="Livreur" links={[{ href: "/livreur", label: "Mes courses" }]} />
      <Page>
        <AutoRefresh seconds={20} />
        <h1 className="text-2xl font-bold">Bonjour {me.name.split(" ")[0]} 🛵</h1>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="À faire" value={active.length} />
          <Stat label="Livrées (24 h)" value={doneToday.length} hint={`Encaissé : ${fcfa(cashToday)}`} />
        </div>

        {active.length === 0 && <div className="card text-center text-sm text-stone-500">Aucune course pour le moment.</div>}

        {active.map((d) => {
          const m = d.merchant;
          const picked = d.status === "PICKED_UP";
          return (
            <div key={d.id} className="card space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-stone-500">{d.code}</span>
                <StatusBadge status={d.status} />
              </div>

              <div className={`rounded-xl p-3 ${picked ? "bg-stone-50 opacity-70" : "bg-brand-50"}`}>
                <div className="text-xs font-semibold uppercase text-brand-800">1 · Retrait</div>
                <div className="font-semibold">{m.shopName ?? m.name}</div>
                <div className="text-sm text-stone-600">{m.pickupLandmark}</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {m.pickupLat != null && (
                    <a className="btn-ghost" href={directionsLink(m.pickupLat, m.pickupLng!)} target="_blank" rel="noopener">Itinéraire</a>
                  )}
                  <a className="btn-ghost" href={`tel:+${m.phone}`}>Appeler</a>
                </div>
              </div>

              <div className={`rounded-xl p-3 ${picked ? "bg-brand-50" : "bg-stone-50"}`}>
                <div className="text-xs font-semibold uppercase text-brand-800">2 · Livraison</div>
                <div className="font-semibold">{d.customerName} · {displayPhone(d.customerPhone)}</div>
                <div className="text-sm text-stone-600">{d.dropLandmark ?? "Pas de repère"}</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {d.dropLat != null && (
                    <a className="btn-ghost" href={directionsLink(d.dropLat, d.dropLng!)} target="_blank" rel="noopener">Itinéraire</a>
                  )}
                  <a className="btn-ghost" href={`tel:+${d.customerPhone}`}>Appeler</a>
                </div>
              </div>

              <div className="text-sm">
                <div>Colis : <strong>{d.packageDesc}</strong>{d.heavy ? " (lourd)" : ""}</div>
                <div>À encaisser : <strong>{fcfa(d.amountToCollect)}</strong></div>
              </div>

              {!picked ? (
                <form action={driverUpdateStatus}>
                  <input type="hidden" name="id" value={d.id} />
                  <input type="hidden" name="action" value="pickup" />
                  <SubmitButton>J&apos;ai récupéré le colis</SubmitButton>
                </form>
              ) : (
                <form action={driverUpdateStatus}>
                  <input type="hidden" name="id" value={d.id} />
                  <input type="hidden" name="action" value="delivered" />
                  <SubmitButton>Livré ✓ {d.amountToCollect > 0 ? `(${fcfa(d.amountToCollect)} encaissés)` : ""}</SubmitButton>
                </form>
              )}
              <details className="text-sm">
                <summary className="cursor-pointer text-rose-700">Signaler un échec</summary>
                <form action={driverUpdateStatus} className="mt-2 space-y-2">
                  <input type="hidden" name="id" value={d.id} />
                  <input type="hidden" name="action" value="failed" />
                  <select name="reason" className="input">
                    <option>Client injoignable</option>
                    <option>Client absent</option>
                    <option>Client a refusé le colis</option>
                    <option>Commerce fermé</option>
                    <option>Adresse introuvable</option>
                  </select>
                  <SubmitButton className="btn-danger w-full">Confirmer l&apos;échec</SubmitButton>
                </form>
              </details>
            </div>
          );
        })}
      </Page>
    </>
  );
}
