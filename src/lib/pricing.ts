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
