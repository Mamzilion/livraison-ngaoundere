"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, users } from "@/lib/db";
import { normalizePhone } from "@/lib/format";
import { SESSION_COOKIE, homeFor, sessionCookieOptions, signSession } from "@/lib/session";

export type FormState = { error?: string; ok?: string } | undefined;

async function openSession(user: { id: string; role: "ADMIN" | "MERCHANT" | "DRIVER"; name: string }) {
  const token = await signSession({ uid: user.id, role: user.role, name: user.name });
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const password = String(formData.get("password") ?? "");
  if (!phone) return { error: "Numéro de téléphone invalide (ex. 677 11 22 33)." };

  const user = await db.query.users.findFirst({ where: eq(users.phone, phone) });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Numéro ou mot de passe incorrect." };
  }
  if (!user.active) return { error: "Ce compte est désactivé. Contactez l'administrateur." };

  await openSession(user);
  const next = String(formData.get("suite") ?? "");
  redirect(next.startsWith(homeFor(user.role)) ? next : homeFor(user.role));
}

const registerSchema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom."),
  shopName: z.string().trim().min(2, "Indiquez le nom du commerce."),
  phone: z.string(),
  password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères."),
  pickupLandmark: z.string().trim().min(3, "Décrivez où se trouve le commerce (quartier, repère)."),
  pickupLat: z.coerce.number().optional(),
  pickupLng: z.coerce.number().optional(),
});

export async function registerMerchant(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(formData);
  if (!raw.pickupLat) delete raw.pickupLat;
  if (!raw.pickupLng) delete raw.pickupLng;
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const phone = normalizePhone(data.phone);
  if (!phone) return { error: "Numéro de téléphone invalide (ex. 677 11 22 33)." };
  if (await db.query.users.findFirst({ where: eq(users.phone, phone) })) {
    return { error: "Un compte existe déjà avec ce numéro." };
  }

  const [user] = await db
    .insert(users)
    .values({
      name: data.name,
      shopName: data.shopName,
      phone,
      passwordHash: await bcrypt.hash(data.password, 10),
      role: "MERCHANT",
      pickupLandmark: data.pickupLandmark,
      pickupLat: data.pickupLat ?? null,
      pickupLng: data.pickupLng ?? null,
    })
    .returning();
  await openSession(user);
  redirect("/commercant");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/connexion");
}
