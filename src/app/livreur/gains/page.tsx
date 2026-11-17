import { and, desc, eq } from "drizzle-orm";
import { Page, Stat } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { db, deliveries } from "@/lib/db";
import { fcfa, formatDateTime } from "@/lib/format";
import { getT } from "@/lib/i18n-server";
import { driverPayOf } from "@/lib/pricing";

export const metadata = { title: "Mes gains" };

function startOfTodayDouala(): Date {
  // Minuit à Ngaoundéré (UTC+1, pas d'heure d'été).
  const now = new Date();
  const d = new Date(now.getTime() + 3600 * 1000);
  d.setUTCHours(0, 0, 0, 0);
  return new Date(d.getTime() - 3600 * 1000);
}

export default async function EarningsPage() {
  const me = await requireUser("DRIVER");
  const t = await getT();
  const done = await db.query.deliveries.findMany({
    where: and(eq(deliveries.driverId, me.id), eq(deliveries.status, "DELIVERED")),
    orderBy: desc(deliveries.deliveredAt),
    with: { merchant: true },
    limit: 200,
  });

  const today = startOfTodayDouala();
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const sum = (list: typeof done) => list.reduce((s, d) => s + driverPayOf(d), 0);
  const todayList = done.filter((d) => d.deliveredAt && d.deliveredAt >= today);
  const weekList = done.filter((d) => d.deliveredAt && d.deliveredAt >= weekAgo);
  const unpaid = done.filter((d) => !d.driverPaid);

  return (
    <Page>
      <h1 className="display text-3xl">{t("d.earnings")}</h1>

      <div className="relative overflow-hidden rounded-3xl bg-brand-600 p-6 text-white">
        <div className="absolute -bottom-16 -right-16 h-44 w-44 rounded-full border-[20px] border-white/15" />
        <div className="eyebrow !text-white/80">{t("d.toBePaid")}</div>
        <div className="display relative mt-2 text-5xl">{fcfa(sum(unpaid))}</div>
        <div className="relative mt-1 text-sm text-white/80">{unpaid.length} · {t("d.history").toLowerCase()}</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label={t("d.today")} value={fcfa(sum(todayList))} hint={`${todayList.length} ${t("d.history").toLowerCase()}`} />
        <Stat label={t("d.week")} value={fcfa(sum(weekList))} hint={`${weekList.length} ${t("d.history").toLowerCase()}`} />
      </div>

      <p className="rounded-2xl bg-paper px-4 py-3 text-sm text-muted ring-1 ring-line">{t("d.payFormula")}</p>

      <section className="space-y-2">
        <h2 className="eyebrow">{t("d.history")}</h2>
        {done.length === 0 && <div className="card text-center text-sm text-muted">{t("d.none")}</div>}
        <div className="card divide-y divide-line/70 !py-1">
          {done.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <div>
                <div className="font-medium">{d.merchant.shopName} → {d.customerName}</div>
                <div className="font-mono text-[11px] text-muted">
                  {d.code} · {formatDateTime(d.deliveredAt)} · {d.distanceKm ?? "?"} km
                </div>
              </div>
              <div className="text-right">
                <div className="display">{fcfa(driverPayOf(d))}</div>
                <div className={`text-[11px] font-semibold ${d.driverPaid ? "text-emerald-700" : "text-brand-700"}`}>
                  {d.driverPaid ? t("d.paidLabel") : t("d.unpaidLabel")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Page>
  );
}
