"use server";

import bcrypt from "bcryptjs";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { appUrl } from "@/lib/config";
import { db, deliveries, passwordResets, users } from "@/lib/db";
import { normalizePhone, randomToken } from "@/lib/format";
import { hashToken } from "@/lib/tokens";
import { computeDriverPay, computePrice, optsOf } from "@/lib/pricing";
import { roadDistance } from "@/lib/routing";
import type { FormState } from "./auth";

export async function assignDriver(formData: FormData) {
  await requireUser("ADMIN");
  const id = String(formData.get("id"));
  const driverId = String(formData.get("driverId") || "");
  if (!driverId) return;
  await db
    .update(deliveries)
    .set({ driverId, status: "ASSIGNED", assignedAt: new Date() })
    .where(and(eq(deliveries.id, id), inArray(deliveries.status, ["READY", "ASSIGNED", "WAITING_LOCATION"])));
  revalidatePath("/admin");
  revalidatePath(`/admin/courses/${id}`);
}

export async function adminSetStatus(formData: FormData) {
  await requireUser("ADMIN");
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (status === "DELIVERED") {
    await db.update(deliveries).set({ status: "DELIVERED", deliveredAt: new Date() }).where(eq(deliveries.id, id));
  } else if (status === "CANCELLED" || status === "FAILED") {
    await db.update(deliveries).set({ status }).where(eq(deliveries.id, id));
  }
  revalidatePath("/admin");
  revalidatePath(`/admin/courses/${id}`);
}

/** Position du client saisie à la main par l'admin (client qui n'arrive pas à partager sa position). */
export async function adminSetDropLocation(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser("ADMIN");
  const id = String(formData.get("id"));
  const coords = String(formData.get("coords") ?? "").match(/(-?\d+(?:\.\d+)?)\s*[,; ]\s*(-?\d+(?:\.\d+)?)/);
  if (!coords) return { error: "Collez des coordonnées au format 7.3220, 13.5840." };
  const lat = Number(coords[1]);
  const lng = Number(coords[2]);
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return { error: "Coordonnées invalides." };

  const d = await db.query.deliveries.findFirst({ where: eq(deliveries.id, id), with: { merchant: true } });
  if (!d) return { error: "Course introuvable." };
  const m = d.merchant;
  const km = m.pickupLat != null && m.pickupLng != null ? (await roadDistance(m.pickupLat, m.pickupLng, lat, lng)).km : null;
  await db
    .update(deliveries)
    .set({
      dropLat: lat,
      dropLng: lng,
      dropAccuracy: null,
      locatedAt: new Date(),
      distanceKm: km,
      price: km != null ? computePrice(km, optsOf(d)) : null,
      driverPay: km != null ? computeDriverPay(km, optsOf(d)) : null,
      status: d.status === "WAITING_LOCATION" ? "READY" : d.status,
    })
    .where(eq(deliveries.id, id));
  revalidatePath(`/admin/courses/${id}`);
  return { ok: "Position enregistrée et prix recalculé." };
}

export async function settleMerchant(formData: FormData) {
  await requireUser("ADMIN");
  const merchantId = String(formData.get("merchantId"));
  await db
    .update(deliveries)
    .set({ settled: true, settledAt: new Date() })
    .where(
      and(eq(deliveries.merchantId, merchantId), eq(deliveries.status, "DELIVERED"), eq(deliveries.settled, false)),
    );
  revalidatePath("/admin/reversements");
}

const driverSchema = z.object({
  name: z.string().trim().min(2, "Indiquez le nom du livreur."),
  phone: z.string(),
  password: z.string().min(6, "Mot de passe : 6 caractères minimum."),
});

export async function createDriver(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser("ADMIN");
  const parsed = driverSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const phone = normalizePhone(parsed.data.phone);
  if (!phone) return { error: "Numéro invalide (ex. 677 11 22 33)." };
  if (await db.query.users.findFirst({ where: eq(users.phone, phone) })) {
    return { error: "Ce numéro a déjà un compte." };
  }
  await db.insert(users).values({
    name: parsed.data.name,
    phone,
    role: "DRIVER",
    passwordHash: await bcrypt.hash(parsed.data.password, 10),
  });
  revalidatePath("/admin/comptes");
  return { ok: `Livreur ${parsed.data.name} créé.` };
}

export async function toggleUserActive(formData: FormData) {
  const admin = await requireUser("ADMIN");
  const id = String(formData.get("id"));
  if (id === admin.id) return;
  const u = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!u) return;
  await db.update(users).set({ active: !u.active }).where(eq(users.id, id));
  revalidatePath("/admin/comptes");
}

/** Marque comme payées toutes les courses livrées d'un livreur. */
export async function payDriver(formData: FormData) {
  await requireUser("ADMIN");
  const driverId = String(formData.get("driverId"));
  await db
    .update(deliveries)
    .set({ driverPaid: true, driverPaidAt: new Date() })
    .where(and(eq(deliveries.driverId, driverId), eq(deliveries.status, "DELIVERED"), eq(deliveries.driverPaid, false)));
  revalidatePath("/admin/reversements");
}

export type ResetLinkState = { error?: string; link?: string; phone?: string; name?: string } | undefined;

/** Crée un lien de réinitialisation valable 24 h, à envoyer à l'utilisateur sur WhatsApp. */
export async function createResetLink(_prev: ResetLinkState, formData: FormData): Promise<ResetLinkState> {
  await requireUser("ADMIN");
  const userId = String(formData.get("userId"));
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) return { error: "Compte introuvable." };

  const token = randomToken(24);
  const expiresAt = new Date(Date.now() + 24 * 3600 * 1000);
  // Une demande en attente de cet utilisateur est complétée ; sinon on en crée une.
  const pending = await db.query.passwordResets.findFirst({
    where: and(eq(passwordResets.userId, userId), isNull(passwordResets.tokenHash), isNull(passwordResets.usedAt)),
  });
  if (pending) {
    await db.update(passwordResets).set({ tokenHash: hashToken(token), expiresAt }).where(eq(passwordResets.id, pending.id));
  } else {
    await db.insert(passwordResets).values({ userId, tokenHash: hashToken(token), expiresAt });
  }
  // Pas de revalidatePath ici : la page garderait sinon le bouton « Envoyer le lien » hors de l'écran.
  return { link: `${appUrl()}/reinitialiser/${token}`, phone: user.phone, name: user.shopName ?? user.name };
}
