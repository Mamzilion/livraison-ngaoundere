import { NewDeliveryForm } from "@/components/forms";
import { Page } from "@/components/ui";
import { getT } from "@/lib/i18n-server";

export const metadata = { title: "Nouvelle course" };

export default async function NewDeliveryPage() {
  const t = await getT();
  return (
    <Page>
      <h1 className="display text-3xl">{t("m.newTitle")}</h1>
      <div className="card">
        <NewDeliveryForm />
      </div>
    </Page>
  );
}
