"use client";

import { useActionState } from "react";
import { login, registerMerchant } from "@/app/actions/auth";
import { createDelivery, updatePickup } from "@/app/actions/merchant";
import { adminSetDropLocation, createDriver } from "@/app/actions/admin";
import { PRICING } from "@/lib/pricing";
import { Alert } from "./ui";
import { LocateFields, SubmitButton } from "./client";

function Messages({ state }: { state: { error?: string; ok?: string } | undefined }) {
  if (state?.error) return <Alert kind="error">{state.error}</Alert>;
  if (state?.ok) return <Alert kind="ok">{state.ok}</Alert>;
  return null;
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(login, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="suite" value={next ?? ""} />
      <div>
        <label className="label" htmlFor="phone">Téléphone</label>
        <input className="input" id="phone" name="phone" inputMode="tel" placeholder="677 11 22 33" required />
      </div>
      <div>
        <label className="label" htmlFor="password">Mot de passe</label>
        <input className="input" id="password" name="password" type="password" required />
      </div>
      <Messages state={state} />
      <SubmitButton>Se connecter</SubmitButton>
    </form>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState(registerMerchant, undefined);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="shopName">Nom du commerce</label>
        <input className="input" id="shopName" name="shopName" placeholder="Boutique Mama Aïssa" required />
      </div>
      <div>
        <label className="label" htmlFor="name">Votre nom</label>
        <input className="input" id="name" name="name" required />
      </div>
      <div>
        <label className="label" htmlFor="phone">Téléphone (WhatsApp)</label>
        <input className="input" id="phone" name="phone" inputMode="tel" placeholder="677 11 22 33" required />
      </div>
      <div>
        <label className="label" htmlFor="password">Mot de passe</label>
        <input className="input" id="password" name="password" type="password" minLength={6} required />
      </div>
      <div>
        <label className="label" htmlFor="pickupLandmark">Où se trouve le commerce ?</label>
        <input
          className="input"
          id="pickupLandmark"
          name="pickupLandmark"
          placeholder="Ex. Grand marché, face à la pharmacie du Lac"
          required
        />
      </div>
      <div className="rounded-xl bg-brand-50 p-3 text-sm text-brand-900">
        Si vous êtes dans votre commerce maintenant, enregistrez sa position GPS : le prix des courses sera
        calculé automatiquement. Vous pourrez aussi le faire plus tard.
      </div>
      <LocateFields />
      <Messages state={state} />
      <SubmitButton>Créer mon compte commerçant</SubmitButton>
    </form>
  );
}

export function NewDeliveryForm() {
  const [state, action] = useActionState(createDelivery, undefined);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="customerName">Nom du client</label>
        <input className="input" id="customerName" name="customerName" required />
      </div>
      <div>
        <label className="label" htmlFor="customerPhone">Téléphone du client</label>
        <input className="input" id="customerPhone" name="customerPhone" inputMode="tel" placeholder="699 11 22 33" required />
      </div>
      <div>
        <label className="label" htmlFor="packageDesc">Colis</label>
        <input className="input" id="packageDesc" name="packageDesc" placeholder="Ex. 2 pagnes, 1 sac à main" required />
      </div>
      <div>
        <label className="label" htmlFor="amountToCollect">Montant à encaisser auprès du client (FCFA)</label>
        <input className="input" id="amountToCollect" name="amountToCollect" type="number" min={0} step={50} placeholder="0 si déjà payé" />
      </div>
      <div>
        <label className="label" htmlFor="dropLandmark">Repère du client (facultatif)</label>
        <input className="input" id="dropLandmark" name="dropLandmark" placeholder="Ex. Dang, mini-cité Les Palmiers" />
      </div>
      <label className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3 text-sm">
        <input type="checkbox" name="heavy" className="h-5 w-5 accent-brand-700" />
        Colis lourd ou volumineux (+{PRICING.heavySupplement} FCFA)
      </label>
      <Messages state={state} />
      <SubmitButton>Créer la course</SubmitButton>
      <p className="text-center text-xs text-stone-500">
        Ensuite, vous enverrez au client un lien pour qu&apos;il partage sa position.
      </p>
    </form>
  );
}

export function PickupForm({ landmark, lat, lng }: { landmark: string; lat: number | null; lng: number | null }) {
  const [state, action] = useActionState(updatePickup, undefined);
  return (
    <form action={action} className="space-y-3">
      <div>
        <label className="label" htmlFor="pickupLandmark">Repère du commerce</label>
        <input className="input" id="pickupLandmark" name="pickupLandmark" defaultValue={landmark} required />
      </div>
      <LocateFields initialLat={lat} initialLng={lng} />
      <Messages state={state} />
      <SubmitButton>Enregistrer</SubmitButton>
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
