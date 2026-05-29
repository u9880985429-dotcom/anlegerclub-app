import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { findSubscriptionsForUser, type ProductSlug } from "@traderiq/api";
import { hasMockProductAccess } from "@/modules/customers";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return session;
}

export async function requireProductAccess(slug: ProductSlug) {
  const session = await requireSession();
  const subs = findSubscriptionsForUser(session.user.id);
  const hasAccess = hasMockProductAccess(subs, slug);
  if (!hasAccess) {
    redirect("/dashboard");
  }
  return session;
}

/**
 * Wie requireProductAccess, aber redirect-frei: der Aufrufer kann selbst entscheiden,
 * ob bei fehlendem Zugriff eine Pitch-Page (statt Redirect) gerendert werden soll.
 */
export async function getProductAccess(slug: ProductSlug): Promise<{
  session: Awaited<ReturnType<typeof requireSession>>;
  hasAccess: boolean;
}> {
  const session = await requireSession();
  const subs = findSubscriptionsForUser(session.user.id);
  const hasAccess = hasMockProductAccess(subs, slug);
  return { session, hasAccess };
}

export function isOnboardedFor(onboardedFor: string[], slug: ProductSlug): boolean {
  return onboardedFor.includes(slug);
}
