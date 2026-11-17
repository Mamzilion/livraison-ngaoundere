import { toggleUserActive } from "@/app/actions/admin";
import { SubmitButton } from "@/components/client";
import { DriverForm, ResetLinkForm } from "@/components/forms";
import { Page } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { and, desc, inArray, isNull } from "drizzle-orm";
import { db, passwordResets, users as usersTable } from "@/lib/db";
import { displayPhone, formatDateTime, whatsappLink } from "@/lib/format";

export const metadata = { title: "Comptes" };

export default async function AccountsPage() {
  await requireUser("ADMIN");
  const users = await db.query.users.findMany({
    where: inArray(usersTable.role, ["DRIVER", "MERCHANT"]),
    orderBy: desc(usersTable.createdAt),
    with: {
      merchantDeliveries: { columns: { id: true } },
      driverDeliveries: { columns: { id: true } },
    },
  });
  const requests = await db.query.passwordResets.findMany({
    where: and(isNull(passwordResets.tokenHash), isNull(passwordResets.usedAt)),
    with: { user: true },
    orderBy: desc(passwordResets.createdAt),
  });
  const drivers = users.filter((u) => u.role === "DRIVER");
  const merchants = users.filter((u) => u.role === "MERCHANT");

  const UserRow = ({ u, count }: { u: (typeof users)[number]; count: number }) => (
    <div className="flex items-center justify-between gap-3 border-b border-stone-100 py-3 last:border-0">
      <div>
        <div className={`font-semibold ${u.active ? "" : "text-stone-400 line-through"}`}>{u.shopName ?? u.name}</div>
        <div className="text-xs text-stone-500">
          {u.shopName ? `${u.name} · ` : ""}
          <a href={whatsappLink(u.phone, "")} className="underline" target="_blank" rel="noopener">{displayPhone(u.phone)}</a>
          {" · "}{count} course(s)
        </div>
      </div>
      <div className="flex shrink-0 gap-1.5">
        <ResetLinkForm userId={u.id} />
        <form action={toggleUserActive}>
          <input type="hidden" name="id" value={u.id} />
          <SubmitButton className="btn-ghost px-3 py-2 text-xs">{u.active ? "Désactiver" : "Réactiver"}</SubmitButton>
        </form>
      </div>
    </div>
  );

  return (
    <Page>
      <h1 className="display text-3xl">Livreurs &amp; commerçants</h1>
      {requests.length > 0 && (
        <div className="card space-y-2 border-brand-600/40 bg-brand-50">
          <h2 className="display text-lg">Mots de passe oubliés ({requests.length})</h2>
          <p className="text-sm text-muted">
            Vérifiez que la demande vient bien de la personne (appel ou WhatsApp), puis envoyez-lui le lien.
          </p>
          {requests.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 border-t border-brand-100 pt-2">
              <div className="text-sm">
                <div className="font-semibold">{r.user.shopName ?? r.user.name}</div>
                <div className="text-xs text-muted">{displayPhone(r.user.phone)} · {formatDateTime(r.createdAt)}</div>
              </div>
              <ResetLinkForm userId={r.userId} />
            </div>
          ))}
        </div>
      )}
      <div className="card space-y-3">
        <h2 className="font-semibold">Ajouter un livreur</h2>
        <DriverForm />
      </div>
      <div className="card">
        <h2 className="font-semibold">Livreurs ({drivers.length})</h2>
        {drivers.map((u) => <UserRow key={u.id} u={u} count={u.driverDeliveries.length} />)}
      </div>
      <div className="card">
        <h2 className="font-semibold">Commerçants ({merchants.length})</h2>
        {merchants.map((u) => <UserRow key={u.id} u={u} count={u.merchantDeliveries.length} />)}
      </div>
    </Page>
  );
}
