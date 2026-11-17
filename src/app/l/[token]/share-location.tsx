"use client";

import { useState } from "react";

type Phase = "idle" | "locating" | "sending" | "done" | "denied" | "error";

export function ShareLocation({
  token,
  alreadyShared,
  initialLandmark,
}: {
  token: string;
  alreadyShared: boolean;
  initialLandmark: string;
}) {
  const [phase, setPhase] = useState<Phase>(alreadyShared ? "done" : "idle");
  const [landmark, setLandmark] = useState(initialLandmark);
  const [message, setMessage] = useState("");

  async function send(body: Record<string, unknown>) {
    setPhase("sending");
    const res = await fetch(`/api/locate/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.error ?? "Une erreur est survenue.");
      setPhase("error");
      return;
    }
    setPhase("done");
  }

  function share() {
    if (!navigator.geolocation) {
      setPhase("denied");
      return;
    }
    setPhase("locating");
    navigator.geolocation.getCurrentPosition(
      (p) =>
        send({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          accuracy: p.coords.accuracy,
          landmark: landmark || undefined,
        }),
      () => setPhase("denied"),
      { enableHighAccuracy: true, timeout: 25000, maximumAge: 0 },
    );
  }

  if (phase === "done") {
    return (
      <div className="space-y-3">
        <div className="rounded-xl bg-emerald-50 p-4 text-center text-emerald-800">
          <div className="text-3xl">✅</div>
          <div className="mt-1 font-semibold">Position bien reçue, merci !</div>
          <div className="text-sm">Le livreur vous appellera en arrivant. Gardez votre téléphone près de vous.</div>
        </div>
        <button className="btn-ghost w-full" onClick={() => setPhase("idle")}>
          Je ne suis plus au même endroit
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="label" htmlFor="landmark">Point de repère (facultatif)</label>
        <input
          id="landmark"
          className="input"
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
          placeholder="Ex. derrière la mosquée, portail bleu"
        />
      </div>

      <button
        className="btn-primary w-full py-4 text-base"
        onClick={share}
        disabled={phase === "locating" || phase === "sending"}
      >
        📍 {phase === "locating" ? "Recherche de votre position…" : phase === "sending" ? "Envoi…" : "Partager ma position"}
      </button>

      {phase === "denied" && (
        <div className="space-y-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          <p>
            Nous n&apos;avons pas pu obtenir votre position. Vérifiez que la <strong>localisation</strong> du téléphone
            est activée, puis réessayez et appuyez sur <strong>« Autoriser »</strong>.
          </p>
          <p>Sinon, écrivez un point de repère précis ci-dessus et envoyez-le :</p>
          <button
            className="btn-ghost w-full"
            disabled={landmark.trim().length < 3}
            onClick={() => send({ landmark: landmark.trim() })}
          >
            Envoyer seulement le point de repère
          </button>
        </div>
      )}
      {phase === "error" && <p className="text-sm text-rose-700">{message}</p>}

      <p className="text-center text-xs text-stone-500">
        Le navigateur va vous demander l&apos;autorisation d&apos;utiliser votre position : appuyez sur « Autoriser ».
      </p>
    </div>
  );
}
