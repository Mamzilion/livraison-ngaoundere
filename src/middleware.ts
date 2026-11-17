import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession, homeFor, type Role } from "@/lib/session";

const PROTECTED: { prefix: string; role: Role }[] = [
  { prefix: "/admin", role: "ADMIN" },
  { prefix: "/commercant", role: "MERCHANT" },
  { prefix: "/livreur", role: "DRIVER" },
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const rule = PROTECTED.find((r) => pathname === r.prefix || pathname.startsWith(r.prefix + "/"));
  if (!rule) return NextResponse.next();

  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const url = new URL("/connexion", req.url);
    url.searchParams.set("suite", pathname);
    return NextResponse.redirect(url);
  }
  if (session.role !== rule.role) {
    return NextResponse.redirect(new URL(homeFor(session.role), req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/commercant/:path*", "/livreur/:path*"],
};
