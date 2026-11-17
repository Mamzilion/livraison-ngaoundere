import Link from "next/link";
import { RegisterForm } from "@/components/forms";
import { Logo } from "@/components/ui";

export const metadata = { title: "Inscription commerçant" };

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-sm px-4 py-10">
      <Link href="/" className="mb-8 flex justify-center"><Logo className="text-lg text-brand-800" /></Link>
      <div className="card space-y-4 p-6">
        <div>
          <h1 className="text-xl font-bold">Compte commerçant</h1>
          <p className="mt-1 text-sm text-stone-600">Gratuit. Vous ne payez que les courses.</p>
        </div>
        <RegisterForm />
      </div>
      <p className="mt-6 text-center text-sm text-stone-600">
        Déjà inscrit ? <Link href="/connexion" className="font-semibold text-brand-800">Se connecter</Link>
      </p>
    </main>
  );
}
