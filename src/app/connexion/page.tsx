import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms";
import { Logo } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { homeFor } from "@/lib/session";

export const metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ suite?: string }> }) {
  const session = await getSession();
  if (session) redirect(homeFor(session.role));
  const { suite } = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-8 self-center"><Logo className="text-lg text-brand-800" /></Link>
      <div className="card space-y-4 p-6">
        <h1 className="text-xl font-bold">Connexion</h1>
        <LoginForm next={suite} />
      </div>
      <p className="mt-6 text-center text-sm text-stone-600">
        Vous êtes commerçant ?{" "}
        <Link href="/inscription" className="font-semibold text-brand-800">Créez votre compte</Link>
      </p>
    </main>
  );
}
