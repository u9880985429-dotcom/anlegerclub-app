import { NextResponse } from "next/server";
import { listPendingBuyers } from "@/lib/ablefy-pending-buyers";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/ablefy/pending-buyers
 *
 * Liefert die letzten Pending-Buyers — Kunden aus eingehenden Ablefy-Webhooks,
 * fuer die in unserer App noch kein User existiert. Wird vom
 * `PendingBuyersCard` im Admin-Dashboard gepollt.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get("limit") ?? "50", 10) || 50));
  return NextResponse.json({ ok: true, buyers: listPendingBuyers(limit) });
}
