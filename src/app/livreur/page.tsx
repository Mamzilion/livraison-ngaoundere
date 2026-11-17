import { driverUpdateStatus } from "@/app/actions/driver";
import { AutoRefresh, SubmitButton } from "@/components/client";
import { AppHeader, Page, Stat, StatusBadge } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { and, asc, eq, gte, inArray } from "drizzle-orm";
import { db, deliveries } from "@/lib/db";
import { directionsLink, displayPhone, fcfa } from "@/lib/format";
import { getT } from "@/lib/i18n-server";
import { Reveal } from "@/components/motion";

export const metadata = { title: "Mes courses" };

export default async function DriverPage() {
  const me = await requireUser("DRIVER");
  const t = await getT();
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
      <AppHeader links={[{ href: "/livreur", label: t("d.title") }]} />
      <Page>
        <AutoRefresh seconds={20} />
        <h1 className="display text-3xl">{t("d.hello")} {me.name.split(" ")[0]} 🛵</h1>
        <div className="grid grid-cols-2 gap-3">
          <Stat label={t("d.todo")} value={active.length} />
          <Stat label={t("d.done24")} value={doneToday.length} hint={`${t("d.cash")} : ${fcfa(cashToday)}`} />
        </div>

        {active.length === 0 && <div className="card text-center text-sm text-muted">{t("d.none")}</div>}

        {active.map((d, idx) => {
          const m = d.merchant;
          const picked = d.status === "PICKED_UP";
          return (
            <Reveal key={d.id} delay={idx * 80} className="card space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted">{d.code}</span>
                <StatusBadge status={d.status} />
              </div>

              <div className={`rounded-2xl p-4 transition ${picked ? "bg-cream opacity-60" : "bg-brand-50 ring-2 ring-brand-600/30"}`}>
                <div className="eyebrow !text-brand-700">{t("d.pickup")}</div>
                <div className="font-semibold">{m.shopName ?? m.name}</div>
                <div className="text-sm text-muted">{m.pickupLandmark}</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {m.pickupLat != null && (
                    <a className="btn-ghost" href={directionsLink(m.pickupLat, m.pickupLng!)} target="_blank" rel="noopener">{t("common.route")}</a>
                  )}
                  <a className="btn-ghost" href={`tel:+${m.phone}`}>{t("common.call")}</a>
                </div>
              </div>

              <div className={`rounded-2xl p-4 transition ${picked ? "bg-brand-50 ring-2 ring-brand-600/30" : "bg-cream"}`}>
                <div className="eyebrow !text-brand-700">{t("d.drop")}</div>
                <div className="font-semibold">{d.customerName} · {displayPhone(d.customerPhone)}</div>
                <div className="text-sm text-muted">{d.dropLandmark ?? t("d.noLandmark")}</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {d.dropLat != null && (
                    <a className="btn-ghost" href={directionsLink(d.dropLat, d.dropLng!)} target="_blank" rel="noopener">{t("common.route")}</a>
                  )}
                  <a className="btn-ghost" href={`tel:+${d.customerPhone}`}>{t("common.call")}</a>
                </div>
              </div>

              <div className="text-sm">
                <div>{t("d.package")} : <strong>{d.packageDesc}</strong>{d.heavy ? " (+)" : ""}</div>
                <div>{t("d.collect")} : <strong>{fcfa(d.amountToCollect)}</strong></div>
              </div>

              {!picked ? (
                <form action={driverUpdateStatus}>
                  <input type="hidden" name="id" value={d.id} />
                  <input type="hidden" name="action" value="pickup" />
                  <SubmitButton className="btn-primary w-full !py-4">{t("d.picked")}</SubmitButton>
                </form>
              ) : (
                <form action={driverUpdateStatus}>
                  <input type="hidden" name="id" value={d.id} />
                  <input type="hidden" name="action" value="delivered" />
                  <SubmitButton className="btn-primary w-full !py-4">{t("d.delivered")} {d.amountToCollect > 0 ? `(${fcfa(d.amountToCollect)} ${t("d.collected")})` : ""}</SubmitButton>
                </form>
              )}
              <details className="text-sm">
                <summary className="cursor-pointer text-rose-700">{t("d.fail")}</summary>
                <form action={driverUpdateStatus} className="mt-2 space-y-2">
                  <input type="hidden" name="id" value={d.id} />
                  <input type="hidden" name="action" value="failed" />
                  <select name="reason" className="input">
                    {(["d.r1", "d.r2", "d.r3", "d.r4", "d.r5"] as const).map((k) => (
                      <option key={k} value={t(k)}>{t(k)}</option>
                    ))}
                  </select>
                  <SubmitButton className="btn-danger w-full">{t("d.failConfirm")}</SubmitButton>
                </form>
              </details>
            </Reveal>
          );
        })}
      </Page>
    </>
  );
}
