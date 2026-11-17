"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db, passwordResets, users } from "@/lib/db";
import { normalizePhone } from "@/lib/format";
import { hashToken } from "@/lib/tokens";
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

/** L'utilisateur signale qu'il a oublié son mot de passe : une demande apparaît chez l'admin. */
export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  if (!phone) return { error: "invalidPhone" };
  const user = await db.query.users.findFirst({ where: eq(users.phone, phone) });
  if (user && user.active) {
    const recent = await db.query.passwordResets.findFirst({
      where: and(
        eq(passwordResets.userId, user.id),
        isNull(passwordResets.tokenHash), // une demande encore en attente de l'admin
        isNull(passwordResets.usedAt),
        gt(passwordResets.createdAt, new Date(Date.now() - 3600 * 1000)),
      ),
    });
    if (!recent) await db.insert(passwordResets).values({ userId: user.id });
  }
  // Même réponse que le compte existe ou non (on ne révèle pas quels numéros sont inscrits).
  return { ok: "sent" };
}

export async function resetPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 6) return { error: "tooShort" };
  if (password !== confirm) return { error: "mismatch" };

  const reset = await db.query.passwordResets.findFirst({
    where: and(eq(passwordResets.tokenHash, hashToken(token)), isNull(passwordResets.usedAt)),
    with: { user: true },
  });
  if (!reset || !reset.expiresAt || reset.expiresAt < new Date() || !reset.user.active) return { error: "expired" };

  await db
    .update(users)
    .set({ passwordHash: await bcrypt.hash(password, 10) })
    .where(eq(users.id, reset.userId));
  await db.update(passwordResets).set({ usedAt: new Date() }).where(eq(passwordResets.userId, reset.userId));
  await openSession(reset.user);
  redirect(homeFor(reset.user.role));
}
