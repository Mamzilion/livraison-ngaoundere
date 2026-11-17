import { SignJWT, jwtVerify } from "jose";

// Ce fichier est utilisé aussi par le middleware (runtime Edge) : pas d'import Node ici.

export type Role = "ADMIN" | "MERCHANT" | "DRIVER";
export type SessionPayload = { uid: string; role: Role; name: string };

export const SESSION_COOKIE = "session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET manquant ou trop court (32 caractères minimum).");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
};

export function homeFor(role: Role): string {
  return role === "ADMIN" ? "/admin" : role === "DRIVER" ? "/livreur" : "/commercant";
}
