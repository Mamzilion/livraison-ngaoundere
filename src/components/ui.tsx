import Link from "next/link";
import type { DeliveryStatus } from "@/lib/schema";
import { logout } from "@/app/actions/auth";
import { APP_NAME } from "@/lib/config";
import { STATUS_COLOR, STATUS_LABEL } from "@/lib/format";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold tracking-tight ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon.svg" alt="" className="h-8 w-8" />
      {APP_NAME}
    </span>
  );
}

export function AppHeader({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link href={links[0]?.href ?? "/"}>
          <Logo className="text-base text-brand-800" />
        </Link>
        <form action={logout}>
          <button className="text-sm text-stone-500 underline-offset-2 hover:underline">Déconnexion</button>
        </form>
      </div>
      <nav className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-3 pb-2 text-sm">
        <span className="sr-only">{title}</span>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="whitespace-nowrap rounded-lg px-3 py-1.5 font-medium text-stone-700 hover:bg-brand-50 hover:text-brand-800"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function Page({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-3xl space-y-4 px-4 py-5">{children}</main>;
}

export function StatusBadge({ status }: { status: DeliveryStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card">
      <div className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</div>
      <div className="mt-1 text-xl font-bold text-stone-900">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-stone-500">{hint}</div>}
    </div>
  );
}

export function Alert({ kind, children }: { kind: "error" | "ok" | "info"; children: React.ReactNode }) {
  const cls =
    kind === "error"
      ? "border-rose-200 bg-rose-50 text-rose-800"
      : kind === "ok"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
        : "border-sky-200 bg-sky-50 text-sky-800";
  return <div className={`rounded-xl border px-3 py-2 text-sm ${cls}`}>{children}</div>;
}

export function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-stone-100 py-2 text-sm last:border-0">
      <span className="text-stone-500">{label}</span>
      <span className="text-right font-medium text-stone-900">{children}</span>
    </div>
  );
}
