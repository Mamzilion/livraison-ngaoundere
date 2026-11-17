import { PickupForm } from "@/components/forms";
import { Page, Row } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { displayPhone } from "@/lib/format";
import { getT } from "@/lib/i18n-server";

export const metadata = { title: "Mon commerce" };

export default async function ProfilePage() {
  const me = await requireUser("MERCHANT");
  const t = await getT();
  return (
    <Page>
      <h1 className="display text-3xl">{t("m.shopTitle")}</h1>
      <div className="card">
        <Row label={t("m.shop")}>{me.shopName}</Row>
        <Row label={t("m.owner")}>{me.name}</Row>
        <Row label={t("common.phone")}>{displayPhone(me.phone)}</Row>
      </div>
      <div className="card space-y-4">
        <div>
          <h2 className="display text-xl">{t("m.pickup")}</h2>
          <p className="mt-1 text-sm text-muted">{t("m.pickupHint")}</p>
        </div>
        <PickupForm landmark={me.pickupLandmark ?? ""} lat={me.pickupLat} lng={me.pickupLng} />
      </div>
    </Page>
  );
}
