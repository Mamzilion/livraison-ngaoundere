import { payDriver, settleMerchant } from "@/app/actions/admin";
import { driverPayOf } from "@/lib/pricing";
import { SubmitButton } from "@/components/client";
import { Page } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { db, deliveries } from "@/lib/db";
import { displayPhone, fcfa } from "@/lib/format";

export const metadata = { title: "Reversements" };

export default async function SettlementsPage() {
  await requireUser("ADMIN");
  const rows = await db.query.deliveries.findMany({
    where: and(eq(deliveries.status, "DELIVERED"), eq(deliveries.settled, false)),
    with: { merchant: true },
  });

  const unpaidDriver = await db.query.deliveries.findMany({
    where: and(eq(deliveries.status, "DELIVERED"), eq(deliveries.driverPaid, false)),
    with: { driver: true },
  });
  const byDriver = new Map<string, { name: string; phone: string; count: number; km: number; pay: number }>();
  for (const d of unpaidDriver) {
    if (!d.driver) continue;
    const cur = byDriver.get(d.driver.id) ?? { name: d.driver.name, phone: d.driver.phone, count: 0, km: 0, pay: 0 };
    cur.count += 1;
    cur.km += d.distanceKm ?? 0;
    cur.pay += driverPayOf(d);
    byDriver.set(d.driver.id, cur);
  }

  const byMerchant = new Map<string, { name: string; phone: string; count: number; collected: number; fees: number }>();
  for (const d of rows) {
    const cur = byMerchant.get(d.merchantId) ?? {
      name: d.merchant.shopName ?? d.merchant.name,
      phone: d.merchant.phone,
      count: 0,
      collected: 0,
      fees: 0,
    };
    cur.count += 1;
    cur.collected += d.amountToCollect;
    cur.fees += d.price ?? 0;
    byMerchant.set(d.merchantId, cur);
  }

  return (
    <Page>
      <h1 className="display text-3xl">Paiements</h1>
      <h2 className="display pt-2 text-xl">Reversements aux commerçants</h2>
      <p className="text-sm text-stone-600">
        Montant à reverser = argent encaissé auprès des clients − prix des courses. Un montant négatif signifie que
        le commerçant nous doit les frais.
      </p>
      {byMerchant.size === 0 && <div className="card text-center text-sm text-stone-500">Rien à reverser.</div>}
      {[...byMerchant.entries()].map(([merchantId, r]) => {
        const net = r.collected - r.fees;
        return (
          <div key={merchantId} className="card space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{r.name}</div>
                <div className="text-xs text-stone-500">{displayPhone(r.phone)} · {r.count} course(s)</div>
              </div>
              <div className={`text-lg font-bold ${net >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{fcfa(net)}</div>
            </div>
            <div className="text-xs text-stone-500">
              Encaissé {fcfa(r.collected)} − frais {fcfa(r.fees)}
            </div>
            <form action={settleMerchant}>
              <input type="hidden" name="merchantId" value={merchantId} />
              <SubmitButton className="btn-primary w-full">Marquer comme reversé (MoMo/OM envoyé)</SubmitButton>
            </form>
          </div>
        );
      })}

      <h2 className="display pt-6 text-xl">Paie des livreurs</h2>
      <p className="text-sm text-muted">
        Rémunération des courses livrées et pas encore payées (150 FCFA + 30 FCFA/km, +100 FCFA colis lourd ou nuit).
      </p>
      {byDriver.size === 0 && <div className="card text-center text-sm text-muted">Rien à payer.</div>}
      {[...byDriver.entries()].map(([driverId, r]) => (
        <div key={driverId} className="card space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold">{r.name}</div>
              <div className="text-xs text-muted">
                {displayPhone(r.phone)} · {r.count} course(s) · {Math.round(r.km * 10) / 10} km
              </div>
            </div>
            <div className="display text-xl text-brand-700">{fcfa(r.pay)}</div>
          </div>
          <form action={payDriver}>
            <input type="hidden" name="driverId" value={driverId} />
            <SubmitButton className="btn-dark w-full">Marquer comme payé (MoMo/OM envoyé)</SubmitButton>
          </form>
        </div>
      ))}
    </Page>
  );
}
