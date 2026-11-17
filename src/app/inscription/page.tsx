import Link from "next/link";
import { RegisterForm } from "@/components/forms";
import { LangSwitch } from "@/components/i18n";
import { Logo } from "@/components/ui";
import { getT } from "@/lib/i18n-server";

export const metadata = { title: "Inscription commerçant" };

export default async function RegisterPage() {
  const t = await getT();
  return (
    <main className="relative mx-auto max-w-sm px-4 py-10">
      <div className="pointer-events-none absolute -left-32 top-10 -z-10 h-80 w-80 rounded-full bg-brand-100/70 blur-3xl" />
      <div className="mb-8 flex items-center justify-between">
        <Link href="/"><Logo /></Link>
        <LangSwitch />
      </div>
      <div className="card animate-fade-up space-y-5 p-6">
        <div>
          <h1 className="display text-3xl">{t("auth.registerTitle")}</h1>
          <p className="mt-1 text-sm text-muted">{t("auth.registerSub")}</p>
        </div>
        <RegisterForm />
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        {t("auth.already")} <Link href="/connexion" className="font-semibold text-brand-700">{t("common.login")}</Link>
      </p>
    </main>
  );
}
