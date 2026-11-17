import Link from "next/link";
import { AutoRefresh } from "@/components/client";
import { Alert, Page, Stat, StatusBadge } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { db, deliveries as deliveriesTable } from "@/lib/db";
import { fcfa, formatDateTime } from "@/lib/format";

export const metadata = { title: "Mes courses" };

export default async function MerchantHome() {
  const me = await requireUser("MERCHANT");
  const deliveries = await db.query.deliveries.findMany({
    where: eq(deliveriesTable.merchantId, me.id),
    orderBy: desc(deliveriesTable.createdAt),
    limit: 50,
  });
  const active = deliveries.filter((d) => ["WAITING_LOCATION", "READY", "ASSIGNED", "PICKED_UP"].includes(d.status));
  const unsettled = deliveries.filter((d) => d.status === "DELIVERED" && !d.settled);
  const toReceive = unsettled.reduce((s, d) => s + d.amountToCollect - (d.price ?? 0), 0);

  return (
    <Page>
      <AutoRefresh />
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-stone-500">Bonjour {me.name.split(" ")[0]}</p>
          <h1 className="text-2xl font-bold">{me.shopName}</h1>
        </div>
        <Link href="/commercant/nouvelle" className="btn-primary">+ Course</Link>
      </div>

      {me.pickupLat == null && (
        <Alert kind="info">
          La position GPS de votre commerce n&apos;est pas encore enregistrée : le prix ne peut pas être calculé
          automatiquement. <Link href="/commercant/profil" className="font-semibold underline">L&apos;enregistrer</Link>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Stat label="En cours" value={active.length} />
        <Stat label="À vous reverser" value={fcfa(toReceive)} hint={`${unsettled.length} course(s) livrée(s)`} />
      </div>

      <section className="space-y-2">
        <h2 className="font-semibold">Dernières courses</h2>
        {deliveries.length === 0 && (
          <div className="card text-center text-sm text-stone-500">
            Aucune course pour l&apos;instant. Créez la première !
          </div>
        )}
        {deliveries.map((d) => (
          <Link key={d.id} href={`/commercant/courses/${d.id}`} className="card block hover:border-brand-500">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{d.customerName}</div>
                <div className="text-sm text-stone-500">{d.packageDesc}</div>
                <div className="mt-1 text-xs text-stone-400">{d.code} · {formatDateTime(d.createdAt)}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={d.status} />
                <span className="text-sm font-semibold">{fcfa(d.price)}</span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </Page>
  );
}
