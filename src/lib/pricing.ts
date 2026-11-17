// Tarification selon la distance — voir le business plan.
// Prix = prise en charge + prix au km, arrondi aux 50 FCFA supérieurs, avec un minimum.

export const PRICING = {
  base: 300, // FCFA, prise en charge
  perKm: 100, // FCFA par km
  minimum: 500, // FCFA
  roundTo: 50, // arrondi
  heavySupplement: 200, // ancien supplément « colis lourd » (courses créées avant le tarif au poids)
  nightSupplement: 200, // après 19 h
  nightStartHour: 19,
  // Les routes ne sont pas en ligne droite : on majore la distance à vol d'oiseau.
  roadFactor: 1.3,
};

// ——— Poids du colis ———
// Jusqu'à 5 kg : compris dans le prix. Au-delà : prix par kilo entamé, jusqu'à 20 kg (limite d'une moto).
// La moitié du supplément revient au livreur, car un colis lourd rend sa course plus difficile.
export const WEIGHT = {
  includedKg: 5,
  perKg: 50, // FCFA par kg au-delà de 5 kg
  maxKg: 20,
  driverShare: 0.5,
};

export function weightSupplement(weightKg: number | null | undefined): number {
  if (weightKg == null || weightKg <= WEIGHT.includedKg) return 0;
  return Math.ceil(weightKg - WEIGHT.includedKg) * WEIGHT.perKg;
}

// ——— Garantie des colis ———
// Sans valeur déclarée : indemnisation plafonnée. Avec valeur déclarée : couverture jusqu'à cette valeur,
// contre une contribution de 1 % (minimum 100 FCFA). Le livreur ne touche rien sur cette contribution.
export const GUARANTEE = {
  baseCap: 10000, // FCFA, plafond d'indemnisation sans valeur déclarée
  rate: 0.01,
  minFee: 100,
  maxDeclared: 300000, // FCFA, valeur maximale acceptée sur une moto
};

export function insuranceFee(declaredValue: number | null | undefined): number {
  if (!declaredValue || declaredValue <= 0) return 0;
  return Math.max(GUARANTEE.minFee, Math.ceil((declaredValue * GUARANTEE.rate) / 50) * 50);
}

type Opts = { weightKg?: number | null; heavy?: boolean; night?: boolean };

/** Supplément « poids » : au kilo pour les nouvelles courses, forfait pour les anciennes cochées « lourd ». */
function weightPart(opts: Opts): number {
  if (opts.weightKg != null) return weightSupplement(opts.weightKg);
  return opts.heavy ? PRICING.heavySupplement : 0;
}

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

/** Estimation de secours (vol d'oiseau × 1,3). La vraie distance routière est dans routing.ts. */
export function roadDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  return Math.round(haversineKm(lat1, lng1, lat2, lng2) * PRICING.roadFactor * 10) / 10;
}

export function computePrice(distanceKm: number, opts: Opts = {}): number {
  const raw = PRICING.base + PRICING.perKm * distanceKm;
  let price = Math.ceil(raw / PRICING.roundTo) * PRICING.roundTo;
  price = Math.max(price, PRICING.minimum);
  price += weightPart(opts);
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
  supplementShare: 0.5, // part des suppléments (poids, nuit) reversée au livreur
};

export function computeDriverPay(distanceKm: number, opts: Opts = {}): number {
  let pay = Math.ceil((DRIVER_PAY.base + DRIVER_PAY.perKm * distanceKm) / DRIVER_PAY.roundTo) * DRIVER_PAY.roundTo;
  pay += Math.round(weightPart(opts) * DRIVER_PAY.supplementShare);
  if (opts.night) pay += PRICING.nightSupplement * DRIVER_PAY.supplementShare;
  return pay;
}

/** Prix de la course et rémunération du livreur, calculés ensemble. */
export function quote(distanceKm: number, opts: Opts = {}) {
  return { distanceKm, price: computePrice(distanceKm, opts), driverPay: computeDriverPay(distanceKm, opts) };
}

/** Rémunération d'une course déjà enregistrée (anciennes courses : recalculée). */
export function driverPayOf(d: {
  driverPay: number | null;
  distanceKm: number | null;
  heavy: boolean;
  night: boolean;
  weightKg?: number | null;
}) {
  if (d.driverPay != null) return d.driverPay;
  return d.distanceKm != null ? computeDriverPay(d.distanceKm, optsOf(d)) : 0;
}

/** Options de tarif d'une course enregistrée. */
export function optsOf(d: { heavy: boolean; night: boolean; weightKg?: number | null }): Opts {
  return { weightKg: d.weightKg ?? null, heavy: d.heavy, night: d.night };
}

/** Courses actives qu'un livreur peut accepter en même temps. */
export const MAX_ACTIVE_PER_DRIVER = 3;
