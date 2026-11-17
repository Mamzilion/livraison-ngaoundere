import { and, count, eq, isNull } from "drizzle-orm";
import { AppHeader } from "@/components/ui";
import { db, deliveries } from "@/lib/db";
import { getT } from "@/lib/i18n-server";

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const t = await getT();
  const [open] = await db
    .select({ n: count() })
    .from(deliveries)
    .where(and(eq(deliveries.status, "READY"), isNull(deliveries.driverId)));
  return (
    <>
      <AppHeader
        items={[
          { href: "/livreur", label: t("d.tabCourses"), icon: "list", exact: true },
          { href: "/livreur/demandes", label: t("d.tabRequests"), icon: "inbox", badge: open.n },
          { href: "/livreur/gains", label: t("d.tabEarnings"), icon: "wallet" },
        ]}
      />
      {children}
    </>
  );
}
