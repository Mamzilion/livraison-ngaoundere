import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { AutoRefresh } from "@/components/client";
import { Reveal } from "@/components/motion";
import { Alert, Page, Stat, StatusBadge } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { db, deliveries as deliveriesTable } from "@/lib/db";
import { fcfa, formatDateTime } from "@/lib/format";
import { getT } from "@/lib/i18n-server";

export const metadata = { title: "Mes courses" };

export default async function MerchantHome() {
  const me = await requireUser("MERCHANT");
  const t = await getT();
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
          <p className="eyebrow">{t("m.hello")} {me.name.split(" ")[0]}</p>
          <h1 className="display mt-1 text-3xl">{me.shopName}</h1>
        </div>
        <Link href="/commercant/nouvelle" className="btn-primary shrink-0 whitespace-nowrap">{t("m.newShort")}</Link>
      </div>

      {me.pickupLat == null && (
        <Alert kind="info">
          {t("m.noGps")}{" "}
          <Link href="/commercant/profil" className="font-semibold underline">{t("m.saveIt")}</Link>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Stat label={t("m.active")} value={active.length} />
        <Stat label={t("m.toReceive")} value={fcfa(toReceive)} hint={`${unsettled.length} ${t("m.delivered")}`} />
      </div>

      <section className="space-y-3 pt-2">
        <h2 className="eyebrow">{t("m.latest")}</h2>
        {deliveries.length === 0 && (
          <div className="card text-center text-sm text-muted">{t("m.none")}</div>
        )}
        {deliveries.map((d, i) => (
          <Reveal key={d.id} delay={Math.min(i, 8) * 50}>
            <Link href={`/commercant/courses/${d.id}`} className="card card-hover block">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{d.customerName}</div>
                  <div className="text-sm text-muted">{d.packageDesc}</div>
                  <div className="mt-1 font-mono text-[11px] text-muted">{d.code} · {formatDateTime(d.createdAt)}</div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <StatusBadge status={d.status} />
                  <span className="display text-base">{fcfa(d.price)}</span>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </section>
    </Page>
  );
}
