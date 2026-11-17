import Link from "next/link";
import { and, count, desc, eq, gte, inArray, sum } from "drizzle-orm";
import { AutoRefresh } from "@/components/client";
import { Page, Stat, StatusBadge } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { db, deliveries as t, type DeliveryStatus } from "@/lib/db";
import { fcfa, formatDateTime } from "@/lib/format";

export const metadata = { title: "Courses" };

const FILTERS: { key: string; label: string; statuses?: DeliveryStatus[] }[] = [
  { key: "actives", label: "Actives", statuses: ["WAITING_LOCATION", "READY", "ASSIGNED", "PICKED_UP"] },
  { key: "a-assigner", label: "À assigner", statuses: ["READY"] },
  { key: "livrees", label: "Livrées", statuses: ["DELIVERED"] },
  { key: "echecs", label: "Échecs/annulées", statuses: ["FAILED", "CANCELLED"] },
  { key: "toutes", label: "Toutes" },
];

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  await requireUser("ADMIN");
  const { f = "actives" } = await searchParams;
  const filter = FILTERS.find((x) => x.key === f) ?? FILTERS[0];
  const where = filter.statuses ? inArray(t.status, filter.statuses) : undefined;

  const since = new Date(Date.now() - 24 * 3600 * 1000);
  const delivered24h = and(eq(t.status, "DELIVERED"), gte(t.deliveredAt, since));
  const [deliveries, [toAssign], [last24]] = await Promise.all([
    db.query.deliveries.findMany({
      where,
      with: { merchant: true, driver: true },
      orderBy: desc(t.createdAt),
      limit: 100,
    }),
    db.select({ n: count() }).from(t).where(eq(t.status, "READY")),
    db.select({ n: count(), revenue: sum(t.price).mapWith(Number) }).from(t).where(delivered24h),
  ]);

  return (
    <Page>
      <AutoRefresh seconds={15} />
      <h1 className="text-2xl font-bold">Courses</h1>
      <div className="grid grid-cols-3 gap-3">
        <Stat label="À assigner" value={toAssign.n} />
        <Stat label="Livrées 24 h" value={last24.n} />
        <Stat label="CA 24 h" value={fcfa(last24.revenue ?? 0)} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((x) => (
          <Link
            key={x.key}
            href={`/admin?f=${x.key}`}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${
              x.key === filter.key ? "bg-brand-700 text-white" : "bg-white text-stone-700 ring-1 ring-stone-200"
            }`}
          >
            {x.label}
          </Link>
        ))}
      </div>

      {deliveries.length === 0 && <div className="card text-center text-sm text-stone-500">Aucune course.</div>}
      {deliveries.map((d) => (
        <Link key={d.id} href={`/admin/courses/${d.id}`} className="card block hover:border-brand-500">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold">
                {d.merchant.shopName} → {d.customerName}
              </div>
              <div className="text-sm text-stone-500">
                {d.packageDesc} · {d.distanceKm != null ? `${d.distanceKm} km` : "distance ?"}
              </div>
              <div className="mt-1 text-xs text-stone-400">
                {d.code} · {formatDateTime(d.createdAt)}
                {d.driver ? ` · ${d.driver.name}` : ""}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <StatusBadge status={d.status} />
              <span className="text-sm font-semibold">{fcfa(d.price)}</span>
            </div>
          </div>
        </Link>
      ))}
    </Page>
  );
}
