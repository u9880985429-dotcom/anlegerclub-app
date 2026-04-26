import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { findSubscriptionsForUser, type ProductSlug } from "@traderiq/api";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return session;
}

export async function requireProductAccess(slug: ProductSlug) {
  const session = await requireSession();
  const subs = findSubscriptionsForUser(session.user.id);
  const hasAccess = subs.some(
    (s) =>
      (s.productSlug === slug || s.productSlug === "all-access") &&
      (s.status === "ACTIVE" || s.status === "CANCELLED" || s.status === "PAID"),
  );
  if (!hasAccess) {
    redirect("/dashboard");
  }
  return session;
}

export function isOnboardedFor(onboardedFor: string[], slug: ProductSlug): boolean {
  return onboardedFor.includes(slug);
}
