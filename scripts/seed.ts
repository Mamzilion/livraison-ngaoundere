// Crée le compte administrateur et, si SEED_DEMO=1, des données de démonstration.
// Lancement : npm run seed
import bcrypt from "bcryptjs";
import { count, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/lib/schema";
import { TERMS_VERSION } from "../src/lib/terms";

const client = postgres(process.env.DIRECT_URL || process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { schema });
const { users, deliveries } = schema;

const phone = (local: string) => "237" + local.replace(/\D/g, "");

async function upsertUser(values: typeof users.$inferInsert) {
  const existing = await db.query.users.findFirst({ where: eq(users.phone, values.phone) });
  if (existing) return existing;
  const [u] = await db.insert(users).values(values).returning();
  return u;
}

async function main() {
  const adminPhone = process.env.ADMIN_PHONE;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPhone || !adminPassword) throw new Error("Définissez ADMIN_PHONE et ADMIN_PASSWORD dans .env");

  await upsertUser({
    name: "Administrateur",
    phone: phone(adminPhone),
    role: "ADMIN",
    passwordHash: await bcrypt.hash(adminPassword, 10),
  });
  console.log("Admin prêt :", adminPhone);

  if (process.env.SEED_DEMO !== "1") return;

  const pw = await bcrypt.hash("demo1234", 10);
  // Coordonnées approximatives, uniquement pour la démo.
  const merchant = await upsertUser({
    name: "Aïssatou Bello",
    shopName: "Boutique Aïssa Mode",
    phone: phone("670000001"),
    role: "MERCHANT",
    passwordHash: pw,
    pickupLandmark: "Grand marché, rangée des pagnes",
    pickupLat: 7.3225,
    pickupLng: 13.5847,
    termsAcceptedAt: new Date(),
    termsVersion: TERMS_VERSION,
  });
  await upsertUser({ name: "Moussa Livreur", phone: phone("670000002"), role: "DRIVER", passwordHash: pw });
  console.log("Démo : commerçant 670000001 / livreur 670000002, mot de passe demo1234");

  const [{ n }] = await db.select({ n: count() }).from(deliveries).where(eq(deliveries.merchantId, merchant.id));
  if (n === 0) {
    await db.insert(deliveries).values({
      code: "NG-DEMO",
      merchantId: merchant.id,
      customerName: "Fadimatou",
      customerPhone: phone("690000003"),
      packageDesc: "2 pagnes wax",
      amountToCollect: 15000,
      locationToken: "demo-token-0001",
      dropLandmark: "Dang, mini-cité Les Palmiers",
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => client.end());
