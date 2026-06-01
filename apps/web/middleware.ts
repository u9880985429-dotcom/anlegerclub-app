import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken, type JWT } from "next-auth/jwt";

/**
 * Zentrales Sicherheits-Gate (Stufe 2 des Architektur-Reviews) — robuste Variante.
 *
 * Schuetzt die Admin-SEITEN (`/admin/*`): kein Login -> /login, falsche Rolle -> /dashboard.
 *
 * Bewusst NICHT mehr abgesichert: die `/api/v1/ablefy/*`-Routen. Die schuetzen
 * sich selbst zuverlaessig im Node-Runtime (requireSession + canManageIntegrations,
 * seit Stufe 1). Sie zusaetzlich am Edge zu pruefen war fragil — die Cookie-
 * Erkennung von getToken kann in Produktion (HTTPS, "__Secure-"-Cookie) daneben-
 * greifen und haette dann die Admin-Daten-Fetches faelschlich mit 403 geblockt
 * ("Fenster gehen nicht mehr"). Edge-Runtime: kein Import aus @traderiq/api.
 */

// Spiegel von canAccessAdmin() aus packages/api/src/mock/permissions.ts
const ADMIN_ROLES = new Set(["OWNER", "ADMIN", "STAFF", "SALES"]);

const SECRET = process.env.NEXTAUTH_SECRET ?? "phase-1-demo-secret-DO-NOT-USE-IN-PROD";

/**
 * Liest das next-auth-JWT robust — egal ob Dev (http, Cookie "next-auth.session-token")
 * oder Prod (https/Vercel, Cookie "__Secure-next-auth.session-token"). Der Cookie-Name
 * haengt bei getToken an `secureCookie`; wir probieren BEIDE Varianten, damit ein
 * eingeloggter Admin in keiner Umgebung faelschlich ausgesperrt wird.
 */
async function readToken(req: NextRequest): Promise<JWT | null> {
  const secure = await getToken({ req, secret: SECRET, secureCookie: true });
  if (secure) return secure;
  return getToken({ req, secret: SECRET, secureCookie: false });
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Nur Admin-Seiten gehen durch dieses Gate (siehe matcher). Safety-Check:
  if (pathname !== "/admin" && !pathname.startsWith("/admin/")) {
    return NextResponse.next();
  }

  const token = await readToken(req);

  // Kein Login -> zur Login-Seite (mit Rueckkehr-Ziel).
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Eingeloggt, aber Rolle eindeutig zu niedrig -> zum Mitglieder-Dashboard.
  // Nur blocken, wenn die Rolle bekannt UND nicht erlaubt ist; im Zweifel
  // durchlassen — die Seite selbst prueft via requireSession nochmals.
  const role = typeof token.role === "string" ? token.role : null;
  if (role && !ADMIN_ROLES.has(role)) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
