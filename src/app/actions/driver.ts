"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { and, count, eq, inArray, isNull } from "drizzle-orm";
import { db, deliveries } from "@/lib/db";
import { MAX_ACTIVE_PER_DRIVER } from "@/lib/pricing";

export async function driverUpdateStatus(formData: FormData) {
  const driver = await requireUser("DRIVER");
  const id = String(formData.get("id"));
  const action = String(formData.get("action"));
  const now = new Date();

  const d = await db.query.deliveries.findFirst({
    where: and(eq(deliveries.id, id), eq(deliveries.driverId, driver.id)),
  });
  if (!d) return;

  if (action === "pickup" && d.status === "ASSIGNED") {
    await db.update(deliveries).set({ status: "PICKED_UP", pickedUpAt: now }).where(eq(deliveries.id, id));
  } else if (action === "delivered" && (d.status === "PICKED_UP" || d.status === "ASSIGNED")) {
    await db.update(deliveries).set({ status: "DELIVERED", deliveredAt: now }).where(eq(deliveries.id, id));
  } else if (action === "failed" && (d.status === "PICKED_UP" || d.status === "ASSIGNED")) {
    const reason = String(formData.get("reason") || "Non précisé");
    await db.update(deliveries).set({ status: "FAILED", failReason: reason }).where(eq(deliveries.id, id));
  }
  revalidatePath("/livreur");
}

export type ClaimState = { error?: string } | undefined;

/** Le livreur accepte lui-même une course prête et sans livreur. */
export async function claimDelivery(_prev: ClaimState, formData: FormData): Promise<ClaimState> {
  const driver = await requireUser("DRIVER");
  const id = String(formData.get("id"));

  const [{ n }] = await db
    .select({ n: count() })
    .from(deliveries)
    .where(and(eq(deliveries.driverId, driver.id), inArray(deliveries.status, ["ASSIGNED", "PICKED_UP"])));
  if (n >= MAX_ACTIVE_PER_DRIVER) {
    return { error: `max:${MAX_ACTIVE_PER_DRIVER}` };
  }

  // La condition "driverId IS NULL" garantit qu'un seul livreur obtient la course.
  const taken = await db
    .update(deliveries)
    .set({ driverId: driver.id, status: "ASSIGNED", assignedAt: new Date() })
    .where(and(eq(deliveries.id, id), eq(deliveries.status, "READY"), isNull(deliveries.driverId)))
    .returning({ id: deliveries.id });
  // Si la course est déjà prise, on garde la page telle quelle pour afficher le message ;
  // elle disparaîtra au prochain rafraîchissement automatique.
  if (taken.length === 0) return { error: "taken" };
  revalidatePath("/livreur", "layout");
  return undefined;
}
