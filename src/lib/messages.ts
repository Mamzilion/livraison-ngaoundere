import type { Delivery, User } from "./schema";
import { APP_NAME } from "./config";
import { directionsLink, displayPhone, fcfa } from "./format";

/** Message envoyé au client final pour qu'il partage sa position. */
export function customerLinkMessage(d: Pick<Delivery, "customerName" | "packageDesc">, shopName: string, link: string) {
  return (
    `Bonjour ${d.customerName}, ici ${APP_NAME}. ` +
    `Nous allons vous livrer votre colis de ${shopName} (${d.packageDesc}). ` +
    `Merci d'ouvrir ce lien et d'appuyer sur « Partager ma position » pour que le livreur vous trouve facilement :\n${link}`
  );
}

/** Message envoyé au livreur sur WhatsApp quand on lui confie une course. */
export function driverMessage(
  d: Delivery & { merchant: User },
  driverPageUrl: string,
) {
  const m = d.merchant;
  const lines = [
    `🛵 Nouvelle course ${d.code}`,
    ``,
    `📦 RETRAIT : ${m.shopName ?? m.name} — ${displayPhone(m.phone)}`,
    m.pickupLandmark ? `Repère : ${m.pickupLandmark}` : null,
    m.pickupLat != null && m.pickupLng != null ? `Itinéraire : ${directionsLink(m.pickupLat, m.pickupLng)}` : null,
    ``,
    `🏠 LIVRAISON : ${d.customerName} — ${displayPhone(d.customerPhone)}`,
    d.dropLandmark ? `Repère : ${d.dropLandmark}` : null,
    d.dropLat != null && d.dropLng != null ? `Itinéraire : ${directionsLink(d.dropLat, d.dropLng)}` : null,
    ``,
    `Colis : ${d.packageDesc}${d.weightKg != null ? ` (${d.weightKg} kg)` : ""}${d.declaredValue ? ` — valeur déclarée ${fcfa(d.declaredValue)}, à manipuler avec soin` : ""}`,
    `À encaisser auprès du client : ${fcfa(d.amountToCollect)}`,
    `Distance : ${d.distanceKm ?? "?"} km — Prix course : ${fcfa(d.price)}`,
    ``,
    `Mettre à jour le statut : ${driverPageUrl}`,
  ];
  return lines.filter((l) => l !== null).join("\n");
}
