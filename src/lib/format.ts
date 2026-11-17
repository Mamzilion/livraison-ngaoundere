import type { DeliveryStatus } from "./schema";

/** Normalise un numéro camerounais au format international sans "+" : 2376XXXXXXXX. */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (/^6\d{8}$/.test(digits)) return "237" + digits;
  if (/^2376\d{8}$/.test(digits)) return digits;
  if (/^002376\d{8}$/.test(digits)) return digits.slice(2);
  return null;
}

/** Affiche 237677112233 sous la forme 677 11 22 33. */
export function displayPhone(phone: string): string {
  const local = phone.startsWith("237") ? phone.slice(3) : phone;
  return local.replace(/^(\d{3})(\d{2})(\d{2})(\d{2})$/, "$1 $2 $3 $4");
}

export function fcfa(n: number | null | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("fr-FR").format(n).replace(/ | /g, " ") + " FCFA";
}

export function formatDateTime(d: Date | null | undefined): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Douala",
  }).format(d);
}

export const STATUS_LABEL: Record<DeliveryStatus, string> = {
  WAITING_LOCATION: "Attente position client",
  READY: "Prête, sans livreur",
  ASSIGNED: "Livreur en route",
  PICKED_UP: "Colis récupéré",
  DELIVERED: "Livrée",
  FAILED: "Échec",
  CANCELLED: "Annulée",
};

export const STATUS_COLOR: Record<DeliveryStatus, string> = {
  WAITING_LOCATION: "bg-amber-100 text-amber-800",
  READY: "bg-sky-100 text-sky-800",
  ASSIGNED: "bg-indigo-100 text-indigo-800",
  PICKED_UP: "bg-violet-100 text-violet-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-rose-100 text-rose-800",
  CANCELLED: "bg-stone-200 text-stone-700",
};

export function mapsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export function directionsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
}

export function whatsappLink(phone: string, text: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function smsLink(phone: string, text: string): string {
  return `sms:+${phone}?body=${encodeURIComponent(text)}`;
}

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export function randomCode(len = 4): string {
  let s = "";
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  for (const b of bytes) s += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return s;
}

export function randomToken(len = 16): string {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
