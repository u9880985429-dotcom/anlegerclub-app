import { NextResponse } from "next/server";
import { listAblefyEvents } from "@/lib/ablefy-store";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/ablefy/events
 *
 * Liefert die letzten Webhook-/Sync-/Test-Events aus dem In-Memory-Store.
 * Polling-basierter Live-Feed fuer das Ablefy-Dashboard in der UI.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get("limit") ?? "50", 10) || 50));
  return NextResponse.json({ ok: true, events: listAblefyEvents(limit) });
}
