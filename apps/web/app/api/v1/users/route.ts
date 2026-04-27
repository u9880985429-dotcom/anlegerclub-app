import { NextResponse } from "next/server";
import { getApiKeyFromRequest, validateApiKey } from "@/lib/api-validation";
import { allUsers } from "@traderiq/api";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/users
 * Scope: users.read
 * Gibt eine reduzierte User-Liste zurück (keine sensiblen Felder wie phone, ablefyId).
 */
export async function GET(req: Request) {
  const key = getApiKeyFromRequest(req);
  if (!key) return NextResponse.json({ error: "missing_api_key" }, { status: 401 });
  const result = validateApiKey(key, "users.read");
  if (!result.valid) {
    return NextResponse.json({ error: "forbidden", reason: result.reason }, { status: 403 });
  }
  const safeUsers = allUsers.map((u) => ({
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    isTeamMember: u.isTeamMember ?? false,
    loginCount: u.loginCount,
  }));
  return NextResponse.json({ ok: true, count: safeUsers.length, data: safeUsers });
}
