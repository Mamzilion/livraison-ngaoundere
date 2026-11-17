"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ICONS: Record<string, React.ReactNode> = {
  list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  plus: <path d="M12 5v14M5 12h14" />,
  store: <path d="M3 9l1.5-5h15L21 9M3 9h18M3 9v11h18V9M9 20v-6h6v6" />,
  inbox: <path d="M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />,
  wallet: <path d="M20 7H5a2 2 0 01-2-2m17 2v12H5a2 2 0 01-2-2V5m17 2V5a2 2 0 00-2-2H5a2 2 0 00-2 2m14 8h.01" />,
  users: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />,
  cash: <path d="M2 7h20v10H2zM12 15a3 3 0 100-6 3 3 0 000 6zM6 12h.01M18 12h.01" />,
};

export type NavItem = { href: string; label: string; icon: keyof typeof ICONS; exact?: boolean; badge?: number };

function isActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
}

/** Barre d'onglets fixée en bas de l'écran (mobile) — on revient à l'accueil de son espace en un geste. */
export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden">
      <div className="mx-auto grid max-w-md" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
        {items.map((it) => {
          const active = isActive(pathname, it);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition ${
                active ? "text-brand-600" : "text-muted"
              }`}
            >
              <span className={`absolute top-0 h-0.5 w-10 rounded-full transition ${active ? "bg-brand-600" : "bg-transparent"}`} />
              <span className="relative">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {ICONS[it.icon]}
                </svg>
                {!!it.badge && (
                  <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 animate-pop items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] text-white">
                    {it.badge}
                  </span>
                )}
              </span>
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Onglets en haut de page sur ordinateur. */
export function TopNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="mx-auto hidden max-w-3xl gap-1 px-3 pb-2.5 text-sm sm:flex">
      {items.map((it) => {
        const active = isActive(pathname, it);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 font-medium transition ${
              active ? "bg-ink text-cream" : "text-ink/70 hover:bg-paper hover:text-ink"
            }`}
          >
            {it.label}
            {!!it.badge && <span className="ml-1.5 rounded-full bg-brand-600 px-1.5 text-[10px] text-white">{it.badge}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
