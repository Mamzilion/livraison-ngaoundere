import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms";
import { LangSwitch } from "@/components/i18n";
import { Logo } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import { homeFor } from "@/lib/session";

export const metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ suite?: string }> }) {
  const session = await getSession();
  if (session) redirect(homeFor(session.role));
  const { suite } = await searchParams;
  const t = await getT();
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-10">
      <div className="pointer-events-none absolute -right-32 top-10 -z-10 h-80 w-80 rounded-full bg-brand-100/70 blur-3xl" />
      <div className="mb-8 flex items-center justify-between">
        <Link href="/"><Logo /></Link>
        <LangSwitch />
      </div>
      <div className="card animate-fade-up space-y-5 p-6">
        <h1 className="display text-3xl">{t("auth.loginTitle")}</h1>
        <LoginForm next={suite} />
        <Link href="/mot-de-passe-oublie" className="block text-center text-sm text-muted underline-offset-2 hover:text-ink hover:underline">
          {t("auth.forgot")}
        </Link>
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        {t("auth.noAccount")}{" "}
        <Link href="/inscription" className="font-semibold text-brand-700">{t("auth.createAccount")}</Link>
      </p>
    </main>
  );
}
