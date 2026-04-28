import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@traderiq/db";

export const dynamic = "force-dynamic";

/**
 * GET  /api/v1/kpi/layout
 *   Liefert das gespeicherte KPI-Layout des aktuellen Users.
 *   - 200 { ok: true, widgets: [...] } wenn vorhanden
 *   - 200 { ok: true, widgets: null }  wenn noch nichts gespeichert
 *   - 401 wenn nicht eingeloggt
 *   - 503 wenn DB nicht erreichbar (Client soll auf localStorage zurueckfallen)
 *
 * POST /api/v1/kpi/layout
 *   Body: { widgets: WidgetInstance[] }
 *   Speichert das Layout des aktuellen Users (upsert).
 *   - 200 { ok: true }
 *   - 401 wenn nicht eingeloggt
 *   - 503 wenn DB nicht erreichbar
 */

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  // Nur fuer OWNER/ADMIN — restliche Rollen sehen das KPI-Dashboard nicht.
  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  try {
    const layout = await prisma.kpiLayout.findFirst({
      where: { userId: session.user.id, name: "Standard" },
    });
    return NextResponse.json({ ok: true, widgets: layout?.widgets ?? null });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "db_unavailable", message: err instanceof Error ? err.message : "unknown" },
      { status: 503 },
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  let body: { widgets?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (!Array.isArray(body.widgets)) {
    return NextResponse.json({ ok: false, error: "invalid_widgets" }, { status: 400 });
  }

  try {
    // User-Row lazy anlegen (wir migrieren Users erst spaeter komplett).
    await prisma.user.upsert({
      where: { id: session.user.id },
      create: {
        id: session.user.id,
        email: session.user.email ?? `${session.user.id}@traderiq.local`,
        firstName: session.user.firstName ?? null,
        lastName: session.user.lastName ?? null,
        role: session.user.role,
      },
      update: {},
    });

    await prisma.kpiLayout.upsert({
      where: { userId_name: { userId: session.user.id, name: "Standard" } },
      create: {
        userId: session.user.id,
        name: "Standard",
        widgets: body.widgets as object,
        isDefault: true,
      },
      update: {
        widgets: body.widgets as object,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "db_unavailable", message: err instanceof Error ? err.message : "unknown" },
      { status: 503 },
    );
  }
}
