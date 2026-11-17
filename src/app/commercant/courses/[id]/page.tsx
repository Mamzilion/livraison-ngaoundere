import { notFound } from "next/navigation";
import { cancelDelivery } from "@/app/actions/merchant";
import { AutoRefresh, CopyButton, SubmitButton } from "@/components/client";
import { Alert, Page, Row, StatusBadge } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { appUrl } from "@/lib/config";
import { and, eq } from "drizzle-orm";
import { db, deliveries } from "@/lib/db";
import { displayPhone, fcfa, formatDateTime, mapsLink, smsLink, whatsappLink } from "@/lib/format";
import { customerLinkMessage } from "@/lib/messages";

export const metadata = { title: "Course" };

export default async function DeliveryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nouvelle?: string }>;
}) {
  const me = await requireUser("MERCHANT");
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

  return (
    <Page>
      <AutoRefresh seconds={15} />
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-stone-500">{d.code}</p>
          <h1 className="text-2xl font-bold">{d.customerName}</h1>
        </div>
        <StatusBadge status={d.status} />
      </div>

      {nouvelle && waitingLocation && <Alert kind="ok">Course créée. Envoyez maintenant le lien au client.</Alert>}

      {waitingLocation && (
        <div className="card space-y-3">
          <h2 className="font-semibold">1. Envoyez ce lien au client</h2>
          <p className="text-sm text-stone-600">
            Il l&apos;ouvre et appuie sur « Partager ma position ». La page se met à jour toute seule dès qu&apos;il
            l&apos;a fait.
          </p>
          <a href={whatsappLink(d.customerPhone, msg)} target="_blank" rel="noopener" className="btn-whatsapp w-full">
            Envoyer par WhatsApp
          </a>
          <div className="grid grid-cols-2 gap-2">
            <a href={smsLink(d.customerPhone, msg)} className="btn-ghost w-full">Par SMS</a>
            <CopyButton text={link} />
          </div>
        </div>
      )}

      <div className="card">
        <Row label="Téléphone client">{displayPhone(d.customerPhone)}</Row>
        <Row label="Colis">{d.packageDesc}{d.heavy ? " (lourd)" : ""}</Row>
        <Row label="À encaisser">{fcfa(d.amountToCollect)}</Row>
        <Row label="Repère client">{d.dropLandmark ?? "—"}</Row>
        <Row label="Position client">
          {d.dropLat != null ? (
            <a className="text-brand-700 underline" href={mapsLink(d.dropLat, d.dropLng!)} target="_blank" rel="noopener">
              Voir sur la carte
            </a>
          ) : (
            "En attente"
          )}
        </Row>
        <Row label="Distance">{d.distanceKm != null ? `${d.distanceKm} km` : "—"}</Row>
        <Row label="Prix de la course">{fcfa(d.price)}</Row>
        <Row label="Livreur">{d.driver ? `${d.driver.name} · ${displayPhone(d.driver.phone)}` : "—"}</Row>
        {d.failReason && <Row label="Motif de l'échec">{d.failReason}</Row>}
      </div>

      <div className="card text-sm">
        <h2 className="mb-2 font-semibold">Historique</h2>
        <Row label="Créée">{formatDateTime(d.createdAt)}</Row>
        <Row label="Position reçue">{formatDateTime(d.locatedAt)}</Row>
        <Row label="Livreur assigné">{formatDateTime(d.assignedAt)}</Row>
        <Row label="Colis récupéré">{formatDateTime(d.pickedUpAt)}</Row>
        <Row label="Livrée">{formatDateTime(d.deliveredAt)}</Row>
        <Row label="Reversée">{d.settled ? formatDateTime(d.settledAt) : "Non"}</Row>
      </div>

      {(d.status === "WAITING_LOCATION" || d.status === "READY") && (
        <form action={cancelDelivery}>
          <input type="hidden" name="id" value={d.id} />
          <SubmitButton className="btn-danger w-full">Annuler la course</SubmitButton>
        </form>
      )}
    </Page>
  );
}
