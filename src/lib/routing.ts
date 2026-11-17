import "server-only";
import { PRICING, haversineKm } from "./pricing";

// Distance réelle par la route, calculée avec OSRM (Open Source Routing Machine, données OpenStreetMap).
// Par défaut : le serveur public d'OSRM, gratuit mais sans garantie de disponibilité.
// Pour plus de fiabilité, on pourra héberger notre propre serveur OSRM et mettre son adresse dans OSRM_URL.
// Si le calcul échoue (réseau, serveur indisponible), on revient à l'estimation à vol d'oiseau × 1,3.

const OSRM_URL = (process.env.OSRM_URL || "https://router.project-osrm.org").replace(/\/$/, "");
const TIMEOUT_MS = 4000;

export type RouteDistance = { km: number; source: "route" | "estimate" };

const round1 = (n: number) => Math.round(n * 10) / 10;

export async function roadDistance(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): Promise<RouteDistance> {
  const estimate: RouteDistance = {
    km: round1(haversineKm(fromLat, fromLng, toLat, toLng) * PRICING.roadFactor),
    source: "estimate",
  };
  if (process.env.OSRM_DISABLED === "1") return estimate;

  // OSRM attend les coordonnées dans l'ordre longitude,latitude.
  const url = `${OSRM_URL}/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false&alternatives=false`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" });
    if (!res.ok) return estimate;
    const data = (await res.json()) as { code?: string; routes?: { distance: number }[] };
    const meters = data.code === "Ok" ? data.routes?.[0]?.distance : undefined;
    if (typeof meters !== "number" || !Number.isFinite(meters)) return estimate;
    return { km: round1(meters / 1000), source: "route" };
  } catch {
    return estimate;
  }
}
