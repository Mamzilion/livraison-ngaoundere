import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, users } from "./db";
import { SESSION_COOKIE, verifySession, type Role } from "./session";

export async function getSession() {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

/** Renvoie l'utilisateur connecté avec le bon rôle, sinon redirige vers la connexion. */
export async function requireUser(role: Role) {
  const session = await getSession();
  if (!session || session.role !== role) redirect("/connexion");
  const user = await db.query.users.findFirst({ where: eq(users.id, session.uid) });
  if (!user || !user.active || user.role !== role) redirect("/connexion");
  return user;
}
