import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { APP_NAME } from "@/lib/config";
import { getT } from "@/lib/i18n-server";
import type { DeliveryStatus } from "@/lib/schema";
import { STATUS_COLOR } from "@/lib/format";
import { LangSwitch } from "./i18n";
import { BottomNav, TopNav, type NavItem } from "./nav";

export function Logo({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon.svg" alt="" className="h-9 w-9" />
      <span className={`display text-xl ${dark ? "text-cream" : "text-ink"}`}>{APP_NAME}</span>
    </span>
  );
}

export async function AppHeader({ items, lang = true }: { items: NavItem[]; lang?: boolean }) {
  const t = await getT();
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line/70 bg-cream/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link href={items[0]?.href ?? "/"} aria-label={t("nav.mySpace")}>
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            {lang && <LangSwitch />}
            <form action={logout}>
              <button className="rounded-full px-3 py-1.5 text-sm text-muted transition hover:bg-paper hover:text-ink">
                {t("common.logout")}
              </button>
            </form>
          </div>
        </div>
        <TopNav items={items} />
      </header>
      <BottomNav items={items} />
    </>
  );
}

/** Lien de retour en haut des pages de détail. */
export async function BackLink({ href, label }: { href: string; label?: string }) {
  const t = await getT();
  return (
    <Link href={href} className="inline-flex items-center rounded-full px-1 py-1 text-sm font-medium text-muted transition hover:text-ink">
      {label ?? t("nav.back")}
    </Link>
  );
}

export function Page({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-3xl animate-fade-up space-y-4 px-4 pb-28 pt-6 sm:pb-10">{children}</main>;
}

const ACTIVE: DeliveryStatus[] = ["WAITING_LOCATION", "ASSIGNED", "PICKED_UP"];

export async function StatusBadge({ status }: { status: DeliveryStatus }) {
  const t = await getT();
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[status]}`}>
      {ACTIVE.includes(status) && <span className="pulse-dot" />}
      {t(`status.${status}`)}
    </span>
  );
}

export function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="card">
      <div className="eyebrow">{label}</div>
      <div className="display mt-2 text-2xl">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-muted">{hint}</div>}
    </div>
  );
}

export function Alert({ kind, children }: { kind: "error" | "ok" | "info"; children: React.ReactNode }) {
  const cls =
    kind === "error"
      ? "border-rose-200 bg-rose-50 text-rose-800"
      : kind === "ok"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
        : "border-brand-100 bg-brand-50 text-brand-800";
  return <div className={`animate-fade-up rounded-2xl border px-4 py-3 text-sm ${cls}`}>{children}</div>;
}

export function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line/70 py-2.5 text-sm last:border-0">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  );
}
