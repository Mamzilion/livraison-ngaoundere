"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { db, deliveries, users } from "@/lib/db";
import { normalizePhone, randomCode, randomToken } from "@/lib/format";
import { computePrice, isNightNow, roadDistanceKm } from "@/lib/pricing";
import type { FormState } from "./auth";

const deliverySchema = z.object({
  customerName: z.string().trim().min(2, "Indiquez le nom du client."),
  customerPhone: z.string(),
  packageDesc: z.string().trim().min(2, "Décrivez le colis."),
  amountToCollect: z.coerce.number().int().min(0, "Montant invalide.").default(0),
  heavy: z.string().optional(),
  dropLandmark: z.string().trim().optional(),
});

export async function createDelivery(_prev: FormState, formData: FormData): Promise<FormState> {
  const merchant = await requireUser("MERCHANT");
  const raw = Object.fromEntries(formData);
  if (raw.amountToCollect === "") raw.amountToCollect = "0";
  const parsed = deliverySchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const customerPhone = normalizePhone(data.customerPhone);
  if (!customerPhone) return { error: "Numéro du client invalide (ex. 699 11 22 33)." };

  let code = "";
  for (let i = 0; i < 5; i++) {
    code = "NG-" + randomCode(4);
    if (!(await db.query.deliveries.findFirst({ where: eq(deliveries.code, code) }))) break;
  }

  const [delivery] = await db
    .insert(deliveries)
    .values({
      code,
      merchantId: merchant.id,
      customerName: data.customerName,
      customerPhone,
      packageDesc: data.packageDesc,
      amountToCollect: data.amountToCollect,
      heavy: data.heavy === "on",
      night: isNightNow(),
      dropLandmark: data.dropLandmark || null,
      locationToken: randomToken(12),
    })
    .returning();
  redirect(`/commercant/courses/${delivery.id}?nouvelle=1`);
}

export async function cancelDelivery(formData: FormData) {
  const merchant = await requireUser("MERCHANT");
  const id = String(formData.get("id"));
  await db
    .update(deliveries)
    .set({ status: "CANCELLED" })
    .where(
      and(
        eq(deliveries.id, id),
        eq(deliveries.merchantId, merchant.id),
        inArray(deliveries.status, ["WAITING_LOCATION", "READY"]),
      ),
    );
  revalidatePath(`/commercant/courses/${id}`);
  revalidatePath("/commercant");
}

const pickupSchema = z.object({
  pickupLandmark: z.string().trim().min(3, "Décrivez où se trouve le commerce."),
  pickupLat: z.coerce.number().min(-90).max(90),
  pickupLng: z.coerce.number().min(-180).max(180),
});

export async function updatePickup(_prev: FormState, formData: FormData): Promise<FormState> {
  const merchant = await requireUser("MERCHANT");
  const parsed = pickupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Appuyez d'abord sur « Utiliser ma position actuelle »." };
  await db.update(users).set(parsed.data).where(eq(users.id, merchant.id));

  // Recalcule le prix des courses en attente de livreur.
  const pending = await db.query.deliveries.findMany({
    where: and(
      eq(deliveries.merchantId, merchant.id),
      eq(deliveries.status, "READY"),
      isNotNull(deliveries.dropLat),
    ),
  });
  for (const d of pending) {
    const km = roadDistanceKm(parsed.data.pickupLat, parsed.data.pickupLng, d.dropLat!, d.dropLng!);
    await db
      .update(deliveries)
      .set({ distanceKm: km, price: computePrice(km, { heavy: d.heavy, night: d.night }) })
      .where(eq(deliveries.id, d.id));
  }
  revalidatePath("/commercant");
  return { ok: "Position du commerce enregistrée." };
}
