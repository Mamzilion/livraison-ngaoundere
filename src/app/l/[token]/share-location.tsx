"use client";

import { useState } from "react";
import { useT } from "@/components/i18n";

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
  const t = useT();
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
      setMessage(data.error ?? t("c.error"));
      setPhase("error");
      return;
    }
    if (navigator.vibrate) navigator.vibrate(60);
    setPhase("done");
  }

  function share() {
    if (!navigator.geolocation) return setPhase("denied");
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
        <div className="animate-pop rounded-3xl bg-emerald-50 p-6 text-center text-emerald-900">
          <svg viewBox="0 0 52 52" className="check-draw mx-auto h-16 w-16" aria-hidden>
            <circle cx="26" cy="26" r="24" fill="#10b981" />
            <path d="M15 27l7 7 15-15" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="display mt-3 text-xl">{t("c.thanks")}</div>
          <div className="mt-1 text-sm">{t("c.thanksText")}</div>
        </div>
        <button className="btn-ghost w-full" onClick={() => setPhase("idle")}>
          {t("c.moved")}
        </button>
      </div>
    );
  }

  const busy = phase === "locating" || phase === "sending";

  return (
    <div className="space-y-4">
      <div>
        <label className="label" htmlFor="landmark">{t("c.landmark")}</label>
        <input
          id="landmark"
          className="input"
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
          placeholder={t("c.landmarkPh")}
        />
      </div>

      <button className="btn-primary relative w-full overflow-hidden !py-5 text-base" onClick={share} disabled={busy}>
        {!busy && <span className="absolute inset-0 animate-pulse rounded-full bg-white/10" aria-hidden />}
        <span className="relative">
          📍 {phase === "locating" ? t("c.locating") : phase === "sending" ? t("c.sending") : t("c.share")}
        </span>
      </button>

      {phase === "denied" && (
        <div className="animate-fade-up space-y-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
          <p>{t("c.denied")}</p>
          <p>{t("c.orLandmark")}</p>
          <button
            className="btn-ghost w-full"
            disabled={landmark.trim().length < 3}
            onClick={() => send({ landmark: landmark.trim() })}
          >
            {t("c.sendLandmark")}
          </button>
        </div>
      )}
      {phase === "error" && <p className="text-sm text-rose-700">{message}</p>}

      <p className="text-center text-xs text-muted">{t("c.allow")}</p>
    </div>
  );
}
