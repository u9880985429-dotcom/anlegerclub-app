import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Phase 1 stub: validates the payload and forwards to NOTIFY_EMAIL_WEBHOOK_URL
 * (Zapier/n8n/Brevo). If the env var is missing, we log + return 200 OK so
 * the admin "Veröffentlichen" button can flow without errors in the demo.
 *
 * Phase 2: enable forwarding (already wired).
 */

const PayloadSchema = z.object({
  template: z.enum(["tradeNew", "tradeClosed", "reportNew", "editorial"]),
  recipientEmail: z.string().email(),
  vorname: z.string().min(1),
  productSlug: z.enum(["starter", "trend", "stillhalter", "cockpit", "all-access"]),
  deeplink: z.string().min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
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
  const target = process.env.NOTIFY_EMAIL_WEBHOOK_URL;
  if (!target) {
    console.info("[notify:email-out] (stub) would deliver:", parsed.data);
    return NextResponse.json({ ok: true, mode: "stub" });
  }
  const res = await fetch(target, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
  return NextResponse.json({ ok: res.ok, status: res.status });
}
