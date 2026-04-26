import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Status gate (spec §5): paused/expired/refunded → /locked.
  const status = session.user.status;
  if (status === "PAUSED" || status === "EXPIRED" || status === "REFUNDED") {
    redirect("/locked");
  }

  return (
    <AppShell
      user={{
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        role: session.user.role,
        productSlug: session.user.productSlug,
      }}
    >
      {children}
    </AppShell>
  );
}
