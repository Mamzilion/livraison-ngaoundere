import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ShareLocation } from "./share-location";
import { LangSwitch } from "@/components/i18n";
import { Logo } from "@/components/ui";
import { db, deliveries } from "@/lib/db";
import { fcfa } from "@/lib/format";
import { getT } from "@/lib/i18n-server";

export const metadata = { title: "Partager ma position", robots: { index: false } };

export default async function LocatePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const t = await getT();
  const d = await db.query.deliveries.findFirst({
    where: eq(deliveries.locationToken, token),
    with: { merchant: true },
  });
  if (!d) notFound();
  const finished = ["DELIVERED", "FAILED", "CANCELLED"].includes(d.status);
  const shop = d.merchant.shopName ?? d.merchant.name;

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col px-4 py-6">
      <div className="pointer-events-none absolute -right-32 top-0 -z-10 h-80 w-80 rounded-full bg-brand-100/80 blur-3xl" />
      <div className="mb-6 flex items-center justify-between">
        <Logo />
        <LangSwitch />
      </div>
      <div className="card animate-fade-up space-y-5 p-6">
        <div>
          <p className="eyebrow">{t("c.hello")} {d.customerName}</p>
          <h1 className="display mt-2 text-3xl leading-tight">{t("c.arriving", { shop })}</h1>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-cream px-3 py-1.5">📦 {d.packageDesc}</span>
            {d.amountToCollect > 0 && (
              <span className="rounded-full bg-forest px-3 py-1.5 text-white">
                {t("c.toPay")} : <strong className="text-brand-500">{fcfa(d.amountToCollect)}</strong>
              </span>
            )}
          </div>
        </div>
        {finished ? (
          <p className="rounded-2xl bg-cream p-4 text-sm">{t("c.finished")}</p>
        ) : (
          <ShareLocation token={token} alreadyShared={d.dropLat != null} initialLandmark={d.dropLandmark ?? ""} />
        )}
      </div>
      <p className="mt-6 text-center text-xs text-muted">🔒 {t("c.privacy")}</p>
    </main>
  );
}
