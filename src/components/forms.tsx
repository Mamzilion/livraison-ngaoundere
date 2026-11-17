"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login, registerMerchant, requestPasswordReset, resetPassword } from "@/app/actions/auth";
import { createDelivery, updatePickup } from "@/app/actions/merchant";
import { adminSetDropLocation, createDriver, createResetLink } from "@/app/actions/admin";
import { GUARANTEE, WEIGHT, insuranceFee, weightSupplement } from "@/lib/pricing";
import { TERMS_SUMMARY } from "@/lib/terms";
import { useT } from "./i18n";
import { LocateFields, SubmitButton } from "./client";

function Messages({ state }: { state: { error?: string; ok?: string } | undefined }) {
  if (state?.error)
    return <div className="animate-fade-up rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{state.error}</div>;
  if (state?.ok)
    return <div className="animate-fade-up rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{state.ok}</div>;
  return null;
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(login, undefined);
  const t = useT();
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="suite" value={next ?? ""} />
      <div>
        <label className="label" htmlFor="phone">{t("common.phone")}</label>
        <input className="input" id="phone" name="phone" inputMode="tel" placeholder="677 11 22 33" required />
      </div>
      <div>
        <label className="label" htmlFor="password">{t("common.password")}</label>
        <input className="input" id="password" name="password" type="password" required />
      </div>
      <Messages state={state} />
      <SubmitButton pendingText={t("common.wait")}>{t("common.login")}</SubmitButton>
    </form>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState(registerMerchant, undefined);
  const t = useT();
  const shown = state?.error === "terms" ? { error: t("auth.termsRequired") } : state;
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="shopName">{t("auth.shopName")}</label>
        <input className="input" id="shopName" name="shopName" placeholder="Boutique Mama Aïssa" required />
      </div>
      <div>
        <label className="label" htmlFor="name">{t("auth.yourName")}</label>
        <input className="input" id="name" name="name" required />
      </div>
      <div>
        <label className="label" htmlFor="phone">{t("auth.whatsapp")}</label>
        <input className="input" id="phone" name="phone" inputMode="tel" placeholder="677 11 22 33" required />
      </div>
      <div>
        <label className="label" htmlFor="password">{t("common.password")}</label>
        <input className="input" id="password" name="password" type="password" minLength={6} required />
      </div>
      <div>
        <label className="label" htmlFor="pickupLandmark">{t("auth.where")}</label>
        <input
          className="input"
          id="pickupLandmark"
          name="pickupLandmark"
          placeholder={t("auth.wherePh")}
          required
        />
      </div>
      <div className="rounded-2xl bg-brand-50 p-4 text-sm text-brand-800">{t("auth.gpsHint")}</div>
      <LocateFields />
      <TermsBox />
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-cream p-4 text-sm transition has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50">
        <input type="checkbox" name="terms" required className="mt-0.5 h-5 w-5 shrink-0 accent-brand-600" />
        <span>{t("auth.termsCheck")}</span>
      </label>
      <Messages state={shown} />
      <SubmitButton pendingText={t("common.wait")}>{t("auth.submitRegister")}</SubmitButton>
    </form>
  );
}

export function NewDeliveryForm() {
  const [state, action] = useActionState(createDelivery, undefined);
  const t = useT();
  const [weight, setWeight] = useState("");
  const [value, setValue] = useState("");
  const w = Number(weight.replace(",", ".")) || 0;
  const extra = weightSupplement(w);
  const fee = insuranceFee(Number(value) || 0);
  const errorText =
    state?.error === "terms"
      ? t("m.termsNeeded")
      : state?.error?.startsWith("max:")
        ? t("m.weightMax")
        : state?.error?.startsWith("maxValue:")
          ? t("m.declaredMax")
          : state?.error;
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="customerName">{t("m.customerName")}</label>
        <input className="input" id="customerName" name="customerName" required />
      </div>
      <div>
        <label className="label" htmlFor="customerPhone">{t("m.customerPhone")}</label>
        <input className="input" id="customerPhone" name="customerPhone" inputMode="tel" placeholder="699 11 22 33" required />
      </div>
      <div>
        <label className="label" htmlFor="packageDesc">{t("m.package")}</label>
        <input className="input" id="packageDesc" name="packageDesc" placeholder={t("m.packagePh")} required />
      </div>
      <div>
        <label className="label" htmlFor="amountToCollect">{t("m.amount")}</label>
        <input className="input" id="amountToCollect" name="amountToCollect" type="number" min={0} step={50} placeholder={t("m.amountPh")} />
      </div>
      <div>
        <label className="label" htmlFor="dropLandmark">{t("m.landmark")}</label>
        <input className="input" id="dropLandmark" name="dropLandmark" placeholder={t("m.landmarkPh")} />
      </div>
      <div>
        <label className="label" htmlFor="weightKg">{t("m.weight")}</label>
        <input
          className="input"
          id="weightKg"
          name="weightKg"
          type="number"
          min={0}
          max={WEIGHT.maxKg}
          step={0.5}
          inputMode="decimal"
          placeholder={`≤ ${WEIGHT.includedKg}`}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <p className={`mt-1.5 text-xs ${w > WEIGHT.maxKg ? "font-semibold text-rose-700" : "text-muted"}`}>
          {w > WEIGHT.maxKg ? t("m.weightMax") : extra > 0 ? t("m.weightExtra", { fee: extra }) : t("m.weightHint")}
        </p>
      </div>
      <div>
        <label className="label" htmlFor="declaredValue">{t("m.declared")}</label>
        <input
          className="input"
          id="declaredValue"
          name="declaredValue"
          type="number"
          min={0}
          max={GUARANTEE.maxDeclared}
          step={500}
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <p className={`mt-1.5 text-xs ${fee > 0 ? "font-semibold text-brand-700" : "text-muted"}`}>
          {fee > 0 ? t("m.guaranteeFee", { fee }) : t("m.declaredHint")}
        </p>
      </div>
      <Messages state={errorText ? { error: errorText } : state} />
      <SubmitButton pendingText={t("common.wait")}>{t("m.create")}</SubmitButton>
      <p className="text-center text-xs text-muted">{t("m.createHint")}</p>
    </form>
  );
}

export function PickupForm({ landmark, lat, lng }: { landmark: string; lat: number | null; lng: number | null }) {
  const [state, action] = useActionState(updatePickup, undefined);
  const t = useT();
  return (
    <form action={action} className="space-y-3">
      <div>
        <label className="label" htmlFor="pickupLandmark">{t("m.pickupLandmark")}</label>
        <input className="input" id="pickupLandmark" name="pickupLandmark" defaultValue={landmark} required />
      </div>
      <LocateFields initialLat={lat} initialLng={lng} />
      <Messages state={state} />
      <SubmitButton pendingText={t("common.wait")}>{t("m.save")}</SubmitButton>
    </form>
  );
}

export function DriverForm() {
  const [state, action] = useActionState(createDriver, undefined);
  return (
    <form action={action} className="space-y-3">
      <input className="input" name="name" placeholder="Nom du livreur" required />
      <input className="input" name="phone" inputMode="tel" placeholder="Téléphone WhatsApp" required />
      <input className="input" name="password" type="text" placeholder="Mot de passe provisoire" minLength={6} required />
      <Messages state={state} />
      <SubmitButton>Créer le compte livreur</SubmitButton>
    </form>
  );
}

export function DropCoordsForm({ id }: { id: string }) {
  const [state, action] = useActionState(adminSetDropLocation, undefined);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="id" value={id} />
      <input className="input" name="coords" placeholder="Coordonnées : 7.3220, 13.5840" />
      <Messages state={state} />
      <SubmitButton className="btn-ghost w-full">Enregistrer la position</SubmitButton>
    </form>
  );
}

export function ForgotForm({ supportPhone }: { supportPhone?: string }) {
  const [state, action] = useActionState(requestPasswordReset, undefined);
  const t = useT();
  if (state?.ok) {
    return (
      <div className="space-y-4">
        <div className="animate-pop rounded-3xl bg-emerald-50 p-5 text-center text-sm text-emerald-900">
          <div className="text-3xl">📨</div>
          <p className="mt-2">{t("auth.forgotSent")}</p>
        </div>
        {supportPhone && (
          <a href={`https://wa.me/${supportPhone}`} target="_blank" rel="noopener" className="btn-whatsapp w-full">
            {t("auth.contactAdmin")}
          </a>
        )}
      </div>
    );
  }
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="phone">{t("common.phone")}</label>
        <input className="input" id="phone" name="phone" inputMode="tel" placeholder="677 11 22 33" required />
      </div>
      {state?.error && <Messages state={{ error: t("auth.invalidPhone") }} />}
      <SubmitButton pendingText={t("common.wait")}>{t("auth.forgotSend")}</SubmitButton>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPassword, undefined);
  const t = useT();
  const errors: Record<string, Parameters<typeof t>[0]> = {
    tooShort: "auth.tooShort",
    mismatch: "auth.mismatch",
    expired: "auth.expired",
  };
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label className="label" htmlFor="password">{t("auth.newPassword")}</label>
        <input className="input" id="password" name="password" type="password" minLength={6} required />
      </div>
      <div>
        <label className="label" htmlFor="confirm">{t("auth.confirm")}</label>
        <input className="input" id="confirm" name="confirm" type="password" minLength={6} required />
      </div>
      {state?.error && <Messages state={{ error: t(errors[state.error] ?? "auth.expired") }} />}
      <SubmitButton pendingText={t("common.wait")}>{t("auth.resetSubmit")}</SubmitButton>
    </form>
  );
}

/** Admin : crée un lien de réinitialisation et l'envoie sur WhatsApp. */
export function ResetLinkForm({ userId }: { userId: string }) {
  const [state, action] = useActionState(createResetLink, undefined);
  if (state?.link && state.phone) {
    const msg = `Bonjour ${state.name}, voici votre lien Babana pour choisir un nouveau mot de passe (valable 24 h) :\n${state.link}`;
    return (
      <a
        href={`https://wa.me/${state.phone}?text=${encodeURIComponent(msg)}`}
        target="_blank"
        rel="noopener"
        className="btn-whatsapp animate-pop px-3 py-2 text-xs"
      >
        Envoyer le lien
      </a>
    );
  }
  return (
    <form action={action}>
      <input type="hidden" name="userId" value={userId} />
      <SubmitButton className="btn-ghost px-3 py-2 text-xs" pendingText="…">Mot de passe</SubmitButton>
      {state?.error && <p className="mt-1 text-xs text-rose-700">{state.error}</p>}
    </form>
  );
}

/** Résumé des conditions de service, avec lien vers le texte complet. */
export function TermsBox() {
  const t = useT();
  return (
    <div className="space-y-2 rounded-2xl border border-line bg-paper p-4 text-sm">
      <div className="display text-base">{t("m.termsTitle")}</div>
      <ul className="space-y-1.5 text-ink/80">
        {TERMS_SUMMARY.map((s) => (
          <li key={s} className="flex gap-2"><span className="text-brand-600">✦</span>{s}</li>
        ))}
      </ul>
      <Link href="/conditions" target="_blank" className="inline-block font-semibold text-brand-700 underline">
        {t("m.termsRead")}
      </Link>
    </div>
  );
}
