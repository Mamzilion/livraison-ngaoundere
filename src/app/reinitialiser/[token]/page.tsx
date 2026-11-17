import Link from "next/link";
import { ResetForm } from "@/components/forms";
import { LangSwitch } from "@/components/i18n";
import { Logo } from "@/components/ui";
import { getT } from "@/lib/i18n-server";

export const metadata = { title: "Nouveau mot de passe", robots: { index: false } };

export default async function ResetPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const t = await getT();
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-10">
      <div className="pointer-events-none absolute -left-32 top-10 -z-10 h-80 w-80 rounded-full bg-brand-100/70 blur-3xl" />
      <div className="mb-8 flex items-center justify-between">
        <Link href="/"><Logo /></Link>
        <LangSwitch />
      </div>
      <div className="card animate-fade-up space-y-4 p-6">
        <h1 className="display text-3xl">{t("auth.resetTitle")}</h1>
        <ResetForm token={token} />
      </div>
      <Link href="/connexion" className="mt-6 text-center text-sm font-semibold text-brand-700">
        {t("auth.backLogin")}
      </Link>
    </main>
  );
}
