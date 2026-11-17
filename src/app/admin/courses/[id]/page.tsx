import { notFound } from "next/navigation";
import { adminSetStatus, assignDriver } from "@/app/actions/admin";
import { AutoRefresh, CopyButton, SubmitButton } from "@/components/client";
import { DropCoordsForm } from "@/components/forms";
import { Page, Row, StatusBadge } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { appUrl } from "@/lib/config";
import { and, asc, eq } from "drizzle-orm";
import { db, deliveries, users } from "@/lib/db";
import { displayPhone, fcfa, formatDateTime, mapsLink, whatsappLink } from "@/lib/format";
import { customerLinkMessage, driverMessage } from "@/lib/messages";

export const metadata = { title: "Course" };

export default async function AdminDeliveryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("ADMIN");
  const { id } = await params;
  const d = await db.query.deliveries.findFirst({
    where: eq(deliveries.id, id),
    with: { merchant: true, driver: true },
  });
  if (!d) notFound();
  const drivers = await db.query.users.findMany({
    where: and(eq(users.role, "DRIVER"), eq(users.active, true)),
    orderBy: asc(users.name),
  });

  const m = d.merchant;
  const base = appUrl();
  const customerLink = `${base}/l/${d.locationToken}`;
  const open = ["WAITING_LOCATION", "READY", "ASSIGNED", "PICKED_UP"].includes(d.status);

  return (
    <Page>
      <AutoRefresh seconds={20} />
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-stone-500">{d.code} · {formatDateTime(d.createdAt)}</p>
          <h1 className="text-2xl font-bold">{m.shopName} → {d.customerName}</h1>
        </div>
        <StatusBadge status={d.status} />
      </div>

      {open && (
        <div className="card space-y-3">
          <h2 className="font-semibold">Livreur</h2>
          {drivers.length === 0 ? (
            <p className="text-sm text-stone-500">Aucun livreur actif. Créez-en un dans « Livreurs &amp; commerçants ».</p>
          ) : (
            <form action={assignDriver} className="flex gap-2">
              <input type="hidden" name="id" value={d.id} />
              <select key={d.driverId ?? "none"} name="driverId" defaultValue={d.driverId ?? ""} className="input">
                <option value="" disabled>Choisir un livreur</option>
                {drivers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} · {displayPhone(u.phone)}</option>
                ))}
              </select>
              <SubmitButton className="btn-primary whitespace-nowrap">Assigner</SubmitButton>
            </form>
          )}
          {d.driver && (
            <a
              href={whatsappLink(d.driver.phone, driverMessage(d, `${base}/livreur`))}
              target="_blank"
              rel="noopener"
              className="btn-whatsapp w-full"
            >
              Envoyer la course à {d.driver.name} sur WhatsApp
            </a>
          )}
          {d.status === "WAITING_LOCATION" && (
            <p className="text-xs text-amber-700">
              Le client n&apos;a pas encore partagé sa position. Vous pouvez quand même assigner un livreur.
            </p>
          )}
        </div>
      )}

      <div className="card">
        <h2 className="mb-2 font-semibold">Retrait</h2>
        <Row label="Commerce">{m.shopName}</Row>
        <Row label="Téléphone">{displayPhone(m.phone)}</Row>
        <Row label="Repère">{m.pickupLandmark ?? "—"}</Row>
        <Row label="GPS">
          {m.pickupLat != null ? (
            <a className="text-brand-700 underline" href={mapsLink(m.pickupLat, m.pickupLng!)} target="_blank" rel="noopener">Carte</a>
          ) : "Non enregistré"}
        </Row>
      </div>

      <div className="card space-y-2">
        <h2 className="font-semibold">Livraison</h2>
        <div>
          <Row label="Client">{d.customerName} · {displayPhone(d.customerPhone)}</Row>
          <Row label="Colis">{d.packageDesc}{d.heavy ? " (lourd)" : ""}</Row>
          <Row label="À encaisser">{fcfa(d.amountToCollect)}</Row>
          <Row label="Repère">{d.dropLandmark ?? "—"}</Row>
          <Row label="GPS">
            {d.dropLat != null ? (
              <a className="text-brand-700 underline" href={mapsLink(d.dropLat, d.dropLng!)} target="_blank" rel="noopener">
                Carte (±{Math.round(d.dropAccuracy ?? 0)} m)
              </a>
            ) : "En attente"}
          </Row>
          <Row label="Distance">{d.distanceKm != null ? `${d.distanceKm} km` : "—"}</Row>
          <Row label="Prix">{fcfa(d.price)}{d.night ? " (nuit)" : ""}</Row>
        </div>
        {d.status === "WAITING_LOCATION" && (
          <div className="space-y-2 border-t border-stone-100 pt-3">
            <p className="text-sm text-stone-600">Relancer le client ou saisir sa position à la main :</p>
            <a
              href={whatsappLink(d.customerPhone, customerLinkMessage(d, m.shopName ?? m.name, customerLink))}
              target="_blank"
              rel="noopener"
              className="btn-whatsapp w-full"
            >
              Renvoyer le lien au client
            </a>
            <CopyButton text={customerLink} />
          </div>
        )}
        {open && <DropCoordsForm id={d.id} />}
      </div>

      <div className="card text-sm">
        <h2 className="mb-2 font-semibold">Historique</h2>
        <Row label="Position reçue">{formatDateTime(d.locatedAt)}</Row>
        <Row label="Assignée">{formatDateTime(d.assignedAt)}</Row>
        <Row label="Récupérée">{formatDateTime(d.pickedUpAt)}</Row>
        <Row label="Livrée">{formatDateTime(d.deliveredAt)}</Row>
        {d.failReason && <Row label="Échec">{d.failReason}</Row>}
      </div>

      {open && (
        <div className="grid grid-cols-2 gap-2">
          <form action={adminSetStatus}>
            <input type="hidden" name="id" value={d.id} />
            <input type="hidden" name="status" value="DELIVERED" />
            <SubmitButton className="btn-ghost w-full">Marquer livrée</SubmitButton>
          </form>
          <form action={adminSetStatus}>
            <input type="hidden" name="id" value={d.id} />
            <input type="hidden" name="status" value="CANCELLED" />
            <SubmitButton className="btn-danger w-full">Annuler</SubmitButton>
          </form>
        </div>
      )}
    </Page>
  );
}
