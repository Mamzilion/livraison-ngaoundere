"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { db, deliveries } from "@/lib/db";

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
