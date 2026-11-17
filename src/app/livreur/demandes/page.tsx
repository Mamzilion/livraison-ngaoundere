import { and, asc, eq, isNull } from "drizzle-orm";
import { AutoRefresh } from "@/components/client";
import { Reveal } from "@/components/motion";
import { Page } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { db, deliveries } from "@/lib/db";
import { fcfa, formatDateTime } from "@/lib/format";
import { getT } from "@/lib/i18n-server";
import { driverPayOf } from "@/lib/pricing";
import { ClaimButton } from "./claim-button";

export const metadata = { title: "Demandes" };

export default async function RequestsPage() {
  await requireUser("DRIVER");
  const t = await getT();
  const open = await db.query.deliveries.findMany({
    where: and(eq(deliveries.status, "READY"), isNull(deliveries.driverId)),
    with: { merchant: true },
    orderBy: asc(deliveries.locatedAt),
    limit: 30,
  });

  return (
    <Page>
      <AutoRefresh seconds={15} />
      <div>
        <h1 className="display text-3xl">{t("d.requests")}</h1>
        <p className="mt-1 text-sm text-muted">{t("d.requestsHint")}</p>
      </div>

      {open.length === 0 && (
        <div className="card flex flex-col items-center gap-3 py-10 text-center text-sm text-muted">
          <span className="text-4xl">🛵</span>
          {t("d.noRequests")}
        </div>
      )}

      {open.map((d, i) => (
        <Reveal key={d.id} delay={i * 70} className="card space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs text-muted">{d.code} · {formatDateTime(d.locatedAt ?? d.createdAt)}</p>
              <p className="display mt-1 text-xl">{d.merchant.shopName ?? d.merchant.name}</p>
              <p className="text-sm text-muted">{d.merchant.pickupLandmark}</p>
            </div>
            <div className="text-right">
              <div className="display text-2xl">{d.distanceKm != null ? `${String(d.distanceKm).replace(".", ",")} km` : "—"}</div>
              {d.heavy && <div className="text-xs font-semibold text-brand-700">{t("m.heavy")}</div>}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="h-2 w-2 shrink-0 rounded-full bg-brand-600" />
            <span className="text-muted">→</span>
            <span className="font-medium">{d.dropLandmark ?? t("d.noLandmark")}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-forest p-3 text-white">
              <div className="eyebrow !text-white/60">{t("d.youEarn")}</div>
              <div className="display mt-1 text-2xl text-brand-500">{fcfa(driverPayOf(d))}</div>
            </div>
            <div className="rounded-2xl bg-cream p-3">
              <div className="eyebrow">{t("d.collect")}</div>
              <div className="display mt-1 text-2xl">{fcfa(d.amountToCollect)}</div>
            </div>
          </div>

          <ClaimButton id={d.id} />
        </Reveal>
      ))}
    </Page>
  );
}
