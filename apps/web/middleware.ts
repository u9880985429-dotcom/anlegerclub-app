import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Zentrales Sicherheits-Gate (Stufe 2 des Architektur-Reviews).
 *
 * Bisher entschied jede Route/Seite selbst ueber Zugriff (inkonsistent, leicht
 * zu vergessen). Diese Middleware ist die EINE oberste Tuer:
 *
 *  - `/api/v1/ablefy/webhook`  → oeffentlich (per HMAC-Signatur geschuetzt, kein Login).
 *  - `/api/v1/ablefy/*` (Rest) → nur Integrations-Rollen (OWNER/ADMIN), sonst 403 (JSON).
 *  - `/admin/*`                → Login erzwingen; dann Mindest-Rolle (Mitarbeiter+).
 *
 * Die Einzel-Guards in den Routen/Seiten bleiben als zweite Schicht bestehen
 * (defense in depth). Edge-Runtime: bewusst KEIN Import aus @traderiq/api
 * (haengt Mock-Daten/Node-Code an), die Rollenlisten sind hier gespiegelt.
 */

// Spiegel von canAccessAdmin() aus packages/api/src/mock/permissions.ts
const ADMIN_ROLES = new Set(["OWNER", "ADMIN", "STAFF", "SALES"]);
// Spiegel von canManageIntegrations()
const INTEGRATION_ROLES = new Set(["OWNER", "ADMIN"]);

const SECRET = process.env.NEXTAUTH_SECRET ?? "phase-1-demo-secret-DO-NOT-USE-IN-PROD";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Oeffentlicher Webhook: NIE blocken (Ablefy ruft ihn ohne Login auf; er ist
  // serverseitig per HMAC abgesichert). Muss vor dem Token-Check stehen.
  if (pathname.startsWith("/api/v1/ablefy/webhook")) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: SECRET });
  const role = (token?.role as string | undefined) ?? null;

  // Ablefy-Management-API: nur OWNER/ADMIN. 403 als JSON (kein Redirect, damit
  // die Admin-UI-fetches eine saubere Fehlerantwort statt HTML bekommen).
  if (pathname.startsWith("/api/v1/ablefy")) {
    if (!role || !INTEGRATION_ROLES.has(role)) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
    return NextResponse.next();
  }

  // Admin-Seiten: erst Login, dann Mindest-Rolle.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (!role || !ADMIN_ROLES.has(role)) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  // Nur diese Pfade durchlaufen die Middleware (Performance + keine Stoerung
  // von statischen Assets / Login / oeffentlichen Seiten).
  matcher: ["/api/v1/ablefy/:path*", "/admin", "/admin/:path*"],
};
