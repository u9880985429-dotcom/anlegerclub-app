import { NextResponse } from "next/server";
import { requireSession } from "@/lib/access";
import { canManageIntegrations } from "@traderiq/api";
import { listAblefyEvents } from "@/lib/ablefy-store";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/ablefy/events
 *
 * Liefert die letzten Webhook-/Sync-/Test-Events aus dem In-Memory-Store.
 * Polling-basierter Live-Feed fuer das Ablefy-Dashboard in der UI.
 */
export async function GET(req: Request) {
  const session = await requireSession();
  if (!canManageIntegrations(session.user.role)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const url = new URL(req.url);
  const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get("limit") ?? "50", 10) || 50));
  return NextResponse.json({ ok: true, events: listAblefyEvents(limit) });
}
