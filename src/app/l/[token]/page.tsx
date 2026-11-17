import { notFound } from "next/navigation";
import { ShareLocation } from "./share-location";
import { Logo } from "@/components/ui";
import { eq } from "drizzle-orm";
import { db, deliveries } from "@/lib/db";

export const metadata = { title: "Partager ma position", robots: { index: false } };

export default async function LocatePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const d = await db.query.deliveries.findFirst({
    where: eq(deliveries.locationToken, token),
    with: { merchant: true },
  });
  if (!d) notFound();
  const finished = ["DELIVERED", "FAILED", "CANCELLED"].includes(d.status);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 py-8">
      <div className="mb-6 flex justify-center"><Logo className="text-lg text-brand-800" /></div>
      <div className="card space-y-4 p-6">
        <div>
          <p className="text-sm text-stone-500">Bonjour {d.customerName},</p>
          <h1 className="mt-1 text-xl font-bold">
            Votre colis de {d.merchant.shopName ?? d.merchant.name} arrive bientôt
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            {d.packageDesc}
            {d.amountToCollect > 0 && (
              <>
                {" · "}À payer à la livraison :{" "}
                <strong>{new Intl.NumberFormat("fr-FR").format(d.amountToCollect)} FCFA</strong>
              </>
            )}
          </p>
        </div>
        {finished ? (
          <p className="rounded-xl bg-stone-100 p-3 text-sm text-stone-700">Cette livraison est terminée. Merci !</p>
        ) : (
          <ShareLocation
            token={token}
            alreadyShared={d.dropLat != null}
            initialLandmark={d.dropLandmark ?? ""}
          />
        )}
      </div>
      <p className="mt-6 text-center text-xs text-stone-500">
        Votre position sert uniquement à cette livraison.
      </p>
    </main>
  );
}
