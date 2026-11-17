import { PickupForm } from "@/components/forms";
import { Page, Row } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { displayPhone } from "@/lib/format";

export const metadata = { title: "Mon commerce" };

export default async function ProfilePage() {
  const me = await requireUser("MERCHANT");
  return (
    <Page>
      <h1 className="text-2xl font-bold">Mon commerce</h1>
      <div className="card">
        <Row label="Commerce">{me.shopName}</Row>
        <Row label="Responsable">{me.name}</Row>
        <Row label="Téléphone">{displayPhone(me.phone)}</Row>
      </div>
      <div className="card space-y-3">
        <div>
          <h2 className="font-semibold">Adresse de retrait</h2>
          <p className="text-sm text-stone-600">
            Placez-vous dans votre commerce et appuyez sur le bouton : c&apos;est ici que le livreur viendra chercher
            les colis, et c&apos;est le point de départ pour calculer le prix.
          </p>
        </div>
        <PickupForm landmark={me.pickupLandmark ?? ""} lat={me.pickupLat} lng={me.pickupLng} />
      </div>
    </Page>
  );
}
