import Link from "next/link";
import { ForgotForm } from "@/components/forms";
import { LangSwitch } from "@/components/i18n";
import { Logo } from "@/components/ui";
import { normalizePhone } from "@/lib/format";
import { getT } from "@/lib/i18n-server";

export const metadata = { title: "Mot de passe oublié" };

export default async function ForgotPage() {
  const t = await getT();
  const support = normalizePhone(process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? "") ?? undefined;
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-10">
      <div className="pointer-events-none absolute -right-32 top-10 -z-10 h-80 w-80 rounded-full bg-brand-100/70 blur-3xl" />
      <div className="mb-8 flex items-center justify-between">
        <Link href="/"><Logo /></Link>
        <LangSwitch />
      </div>
      <div className="card animate-fade-up space-y-4 p-6">
        <h1 className="display text-3xl">{t("auth.forgotTitle")}</h1>
        <p className="text-sm text-muted">{t("auth.forgotText")}</p>
        <ForgotForm supportPhone={support} />
      </div>
      <Link href="/connexion" className="mt-6 text-center text-sm font-semibold text-brand-700">
        {t("auth.backLogin")}
      </Link>
    </main>
  );
}
