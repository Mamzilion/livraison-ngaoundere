import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { cancelDelivery } from "@/app/actions/merchant";
import { AutoRefresh, CopyButton, SubmitButton } from "@/components/client";
import { Alert, BackLink, Page, Row, StatusBadge } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { appUrl } from "@/lib/config";
import { db, deliveries } from "@/lib/db";
import { displayPhone, fcfa, formatDateTime, mapsLink, smsLink, whatsappLink } from "@/lib/format";
import { getT } from "@/lib/i18n-server";
import { customerLinkMessage } from "@/lib/messages";
import type { DeliveryStatus } from "@/lib/schema";

export const metadata = { title: "Course" };

const FLOW: DeliveryStatus[] = ["WAITING_LOCATION", "READY", "ASSIGNED", "PICKED_UP", "DELIVERED"];

export default async function DeliveryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nouvelle?: string }>;
}) {
  const me = await requireUser("MERCHANT");
  const t = await getT();
  const { id } = await params;
  const { nouvelle } = await searchParams;
  const d = await db.query.deliveries.findFirst({
    where: and(eq(deliveries.id, id), eq(deliveries.merchantId, me.id)),
    with: { driver: true },
  });
  if (!d) notFound();

  const link = `${appUrl()}/l/${d.locationToken}`;
  const msg = customerLinkMessage(d, me.shopName ?? me.name, link);
  const waitingLocation = d.status === "WAITING_LOCATION";
  const stepIndex = FLOW.indexOf(d.status);

  return (
    <Page>
      <AutoRefresh seconds={15} />
      <BackLink href="/commercant" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-muted">{d.code}</p>
          <h1 className="display mt-1 text-3xl">{d.customerName}</h1>
        </div>
        <StatusBadge status={d.status} />
      </div>

      {stepIndex >= 0 && (
        <div className="card">
          <div className="flex items-center gap-1.5">
            {FLOW.map((s, i) => (
              <div key={s} className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                <div
                  className={`h-full rounded-full bg-brand-600 transition-all duration-700 ${i <= stepIndex ? "w-full" : "w-0"}`}
                  style={{ transitionDelay: `${i * 120}ms` }}
                />
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm font-medium">{t(`status.${d.status}`)}</p>
        </div>
      )}

      {nouvelle && waitingLocation && <Alert kind="ok">{t("m.created")}</Alert>}

      {waitingLocation && (
        <div className="card space-y-3">
          <h2 className="display text-xl">{t("m.sendLink")}</h2>
          <p className="text-sm text-muted">{t("m.sendLinkHint")}</p>
          <a href={whatsappLink(d.customerPhone, msg)} target="_blank" rel="noopener" className="btn-whatsapp w-full !py-4">
            {t("m.sendWhatsapp")}
          </a>
          <div className="grid grid-cols-2 gap-2">
            <a href={smsLink(d.customerPhone, msg)} className="btn-ghost w-full">{t("m.bySms")}</a>
            <CopyButton text={link} />
          </div>
        </div>
      )}

      <div className="card">
        <Row label={t("m.customerPhone")}>{displayPhone(d.customerPhone)}</Row>
        <Row label={t("m.package")}>{d.packageDesc}</Row>
        {d.weightKg != null && <Row label={t("m.weightRow")}>{String(d.weightKg).replace(".", ",")} kg</Row>}
        {d.declaredValue != null && (
          <Row label={t("m.declaredRow")}>{fcfa(d.declaredValue)} · {t("m.feeRow")} {fcfa(d.insuranceFee)}</Row>
        )}
        <Row label={t("d.collect")}>{fcfa(d.amountToCollect)}</Row>
        <Row label={t("m.landmark")}>{d.dropLandmark ?? "—"}</Row>
        <Row label={t("m.customerPos")}>
          {d.dropLat != null ? (
            <a className="text-brand-700 underline" href={mapsLink(d.dropLat, d.dropLng!)} target="_blank" rel="noopener">
              {t("m.seeMap")}
            </a>
          ) : (
            t("m.waiting")
          )}
        </Row>
        <Row label={t("m.distance")}>{d.distanceKm != null ? `${d.distanceKm} km` : "—"}</Row>
        <Row label={t("m.price")}><span className="display text-base">{fcfa(d.price)}</span></Row>
        <Row label={t("m.driver")}>{d.driver ? `${d.driver.name} · ${displayPhone(d.driver.phone)}` : "—"}</Row>
        {d.failReason && <Row label={t("m.failReason")}>{d.failReason}</Row>}
      </div>

      <div className="card text-sm">
        <h2 className="eyebrow mb-2">{t("m.history")}</h2>
        <Row label={t("m.hCreated")}>{formatDateTime(d.createdAt)}</Row>
        <Row label={t("m.hLocated")}>{formatDateTime(d.locatedAt)}</Row>
        <Row label={t("m.hAssigned")}>{formatDateTime(d.assignedAt)}</Row>
        <Row label={t("m.hPicked")}>{formatDateTime(d.pickedUpAt)}</Row>
        <Row label={t("m.hDelivered")}>{formatDateTime(d.deliveredAt)}</Row>
        <Row label={t("m.hSettled")}>{d.settled ? formatDateTime(d.settledAt) : t("m.no")}</Row>
      </div>

      {(d.status === "WAITING_LOCATION" || d.status === "READY") && (
        <form action={cancelDelivery}>
          <input type="hidden" name="id" value={d.id} />
          <SubmitButton className="btn-danger w-full">{t("m.cancel")}</SubmitButton>
        </form>
      )}
    </Page>
  );
}
