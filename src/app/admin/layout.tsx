import { and, count, eq, isNull } from "drizzle-orm";
import { AppHeader } from "@/components/ui";
import { db, deliveries, passwordResets } from "@/lib/db";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [[ready], [resets]] = await Promise.all([
    db.select({ n: count() }).from(deliveries).where(eq(deliveries.status, "READY")),
    db
      .select({ n: count() })
      .from(passwordResets)
      .where(and(isNull(passwordResets.tokenHash), isNull(passwordResets.usedAt))),
  ]);
  return (
    <>
      <AppHeader
        lang={false}
        items={[
          { href: "/admin", label: "Courses", icon: "list", exact: true, badge: ready.n },
          { href: "/admin/reversements", label: "Paiements", icon: "cash" },
          { href: "/admin/comptes", label: "Comptes", icon: "users", badge: resets.n },
        ]}
      />
      {children}
    </>
  );
}
