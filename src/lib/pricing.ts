// Tarification selon la distance — voir le business plan.
// Prix = prise en charge + prix au km, arrondi aux 50 FCFA supérieurs, avec un minimum.

export const PRICING = {
  base: 300, // FCFA, prise en charge
  perKm: 80, // FCFA par km
  minimum: 500, // FCFA
  roundTo: 50, // arrondi
  heavySupplement: 200, // colis lourd ou volumineux
  nightSupplement: 200, // après 19 h
  nightStartHour: 19,
  // Les routes ne sont pas en ligne droite : on majore la distance à vol d'oiseau.
  roadFactor: 1.3,
};

/** Distance à vol d'oiseau entre deux points GPS, en km (formule de haversine). */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Distance routière estimée, en km, arrondie à 0,1 km. */
export function roadDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  return Math.round(haversineKm(lat1, lng1, lat2, lng2) * PRICING.roadFactor * 10) / 10;
}

export function computePrice(distanceKm: number, opts: { heavy?: boolean; night?: boolean } = {}): number {
  const raw = PRICING.base + PRICING.perKm * distanceKm;
  let price = Math.ceil(raw / PRICING.roundTo) * PRICING.roundTo;
  price = Math.max(price, PRICING.minimum);
  if (opts.heavy) price += PRICING.heavySupplement;
  if (opts.night) price += PRICING.nightSupplement;
  return price;
}

/** Heure actuelle à Ngaoundéré (Africa/Douala, UTC+1). */
export function isNightNow(date = new Date()): boolean {
  const hour = Number(
    new Intl.DateTimeFormat("fr-FR", { hour: "numeric", hourCycle: "h23", timeZone: "Africa/Douala" }).format(date),
  );
  return hour >= PRICING.nightStartHour || hour < 6;
}

// ——— Rémunération du livreur ———
// Le livreur gagne plus sur les longues courses : une part fixe + un montant par km.
// Le carburant reste à la charge de Babana (moto de l'entreprise).
export const DRIVER_PAY = {
  base: 150, // FCFA par course
  perKm: 30, // FCFA par km
  roundTo: 50,
  supplementShare: 0.5, // part des suppléments (colis lourd, nuit) reversée au livreur
};

export function computeDriverPay(distanceKm: number, opts: { heavy?: boolean; night?: boolean } = {}): number {
  let pay = Math.ceil((DRIVER_PAY.base + DRIVER_PAY.perKm * distanceKm) / DRIVER_PAY.roundTo) * DRIVER_PAY.roundTo;
  if (opts.heavy) pay += PRICING.heavySupplement * DRIVER_PAY.supplementShare;
  if (opts.night) pay += PRICING.nightSupplement * DRIVER_PAY.supplementShare;
  return pay;
}

/** Prix de la course et rémunération du livreur, calculés ensemble. */
export function quote(distanceKm: number, opts: { heavy?: boolean; night?: boolean } = {}) {
  return { distanceKm, price: computePrice(distanceKm, opts), driverPay: computeDriverPay(distanceKm, opts) };
}

/** Rémunération d'une course déjà enregistrée (anciennes courses : recalculée). */
export function driverPayOf(d: { driverPay: number | null; distanceKm: number | null; heavy: boolean; night: boolean }) {
  if (d.driverPay != null) return d.driverPay;
  return d.distanceKm != null ? computeDriverPay(d.distanceKm, { heavy: d.heavy, night: d.night }) : 0;
}

/** Courses actives qu'un livreur peut accepter en même temps. */
export const MAX_ACTIVE_PER_DRIVER = 3;
