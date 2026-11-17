import { NewDeliveryForm } from "@/components/forms";
import { Page } from "@/components/ui";

export const metadata = { title: "Nouvelle course" };

export default function NewDeliveryPage() {
  return (
    <Page>
      <h1 className="text-2xl font-bold">Nouvelle course</h1>
      <div className="card">
        <NewDeliveryForm />
      </div>
    </Page>
  );
}
