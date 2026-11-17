"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  className = "btn-primary w-full",
  pendingText = "Patientez…",
}: {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}

export function CopyButton({ text, label = "Copier le lien" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn-ghost w-full"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          window.prompt("Copiez ce lien :", text);
        }
      }}
    >
      {done ? "Copié ✓" : label}
    </button>
  );
}

/** Rafraîchit la page régulièrement pour voir les nouveaux statuts sans recharger. */
export function AutoRefresh({ seconds = 20 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(t);
  }, [router, seconds]);
  return null;
}

/** Bouton qui remplit des champs cachés lat/lng avec la position GPS du téléphone. */
export function LocateFields({
  latName = "pickupLat",
  lngName = "pickupLng",
  initialLat,
  initialLng,
}: {
  latName?: string;
  lngName?: string;
  initialLat?: number | null;
  initialLng?: number | null;
}) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    initialLat != null && initialLng != null ? { lat: initialLat, lng: initialLng } : null,
  );
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  return (
    <div className="space-y-2">
      <input type="hidden" name={latName} value={coords?.lat ?? ""} />
      <input type="hidden" name={lngName} value={coords?.lng ?? ""} />
      <button
        type="button"
        className="btn-accent w-full"
        onClick={() => {
          if (!navigator.geolocation) return setState("error");
          setState("loading");
          navigator.geolocation.getCurrentPosition(
            (p) => {
              setCoords({ lat: p.coords.latitude, lng: p.coords.longitude });
              setState("idle");
            },
            () => setState("error"),
            { enableHighAccuracy: true, timeout: 20000 },
          );
        }}
      >
        📍 {state === "loading" ? "Recherche de la position…" : "Utiliser ma position actuelle"}
      </button>
      {coords && (
        <p className="text-xs text-emerald-700">
          Position enregistrée : {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
        </p>
      )}
      {state === "error" && (
        <p className="text-xs text-rose-700">
          Impossible d&apos;obtenir la position. Activez la localisation du téléphone et autorisez le navigateur.
        </p>
      )}
    </div>
  );
}
