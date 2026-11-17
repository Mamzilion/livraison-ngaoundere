import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, deliveries } from "@/lib/db";
import { computeDriverPay, computePrice, roadDistanceKm } from "@/lib/pricing";

const bodySchema = z.object({
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  accuracy: z.number().nonnegative().optional(),
  landmark: z.string().trim().max(300).optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  const { lat, lng, accuracy, landmark } = parsed.data;
  if ((lat == null || lng == null) && !landmark) {
    return NextResponse.json({ error: "Position ou point de repère requis." }, { status: 400 });
  }

  const d = await db.query.deliveries.findFirst({
    where: eq(deliveries.locationToken, token),
    with: { merchant: true },
  });
  if (!d) return NextResponse.json({ error: "Lien invalide." }, { status: 404 });
  if (["DELIVERED", "FAILED", "CANCELLED"].includes(d.status)) {
    return NextResponse.json({ error: "Cette livraison est terminée." }, { status: 409 });
  }

  const m = d.merchant;
  let distanceKm = d.distanceKm;
  let price = d.price;
  let driverPay = d.driverPay;
  if (lat != null && lng != null && m.pickupLat != null && m.pickupLng != null) {
    distanceKm = roadDistanceKm(m.pickupLat, m.pickupLng, lat, lng);
    price = computePrice(distanceKm, { heavy: d.heavy, night: d.night });
    driverPay = computeDriverPay(distanceKm, { heavy: d.heavy, night: d.night });
  }

  const hasGps = lat != null && lng != null;
  await db
    .update(deliveries)
    .set({
      ...(hasGps ? { dropLat: lat, dropLng: lng, dropAccuracy: accuracy ?? null, locatedAt: new Date() } : {}),
      ...(landmark ? { dropLandmark: landmark } : {}),
      distanceKm,
      price,
      driverPay,
      status: d.status === "WAITING_LOCATION" && hasGps ? "READY" : d.status,
    })
    .where(eq(deliveries.id, d.id));

  return NextResponse.json({ ok: true, distanceKm, price });
}
