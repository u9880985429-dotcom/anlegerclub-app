import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Phase 1 stub: Phase 2 swaps in Expo / FCM / APNs / VAPID.
 */

const PayloadSchema = z.object({
  template: z.enum(["tradeNew", "tradeClosed", "reportNew", "mention", "editorial"]),
  recipientId: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  deeplink: z.string().min(1),
});

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const parsed = PayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const target = process.env.NOTIFY_PUSH_WEBHOOK_URL;
  if (!target) {
    console.info("[notify:push-out] (stub) would deliver:", parsed.data);
    return NextResponse.json({ ok: true, mode: "stub" });
  }
  const res = await fetch(target, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
  return NextResponse.json({ ok: res.ok, status: res.status });
}
