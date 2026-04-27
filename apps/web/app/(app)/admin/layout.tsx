import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/access";
import { Shield, Crown } from "lucide-react";

const ADMIN_NAV = [
  { href: "/admin", label: "Übersicht", restricted: false },
  { href: "/admin/users", label: "Mitglieder", restricted: false },
  { href: "/admin/subscriptions", label: "Subscriptions & Einladungen", restricted: false },
  { href: "/admin/community", label: "Community-Moderation", restricted: false },
  { href: "/admin/integrations", label: "API · Webhooks · Plugins", restricted: false },
  { href: "/admin/audit", label: "Audit-Log", restricted: false },
  { href: "/admin/kpi", label: "KPI-Dashboard", restricted: true },
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const role = session.user.role;
  if (role !== "STAFF" && role !== "OWNER" && role !== "ADMIN") {
    redirect("/dashboard");
  }
  const showRestricted = role === "OWNER" || role === "ADMIN";
  const navItems = ADMIN_NAV.filter((n) => !n.restricted || showRestricted);
  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="card-base h-fit p-3 lg:sticky lg:top-6">
        <div className="mb-3 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wider text-brand">
          <Shield className="h-3.5 w-3.5" />
          Admin-Backend
        </div>
        <nav className="space-y-0.5 text-sm">
          {navItems.map((n) => (
            <Link
              key={n.href}
              href={n.href as never}
              className={`flex items-center justify-between rounded-md px-3 py-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground ${n.restricted ? "border border-brand/30 bg-brand/5 text-brand hover:text-brand" : ""}`}
            >
              <span>{n.label}</span>
              {n.restricted && <Crown className="h-3 w-3 flex-shrink-0" />}
            </Link>
          ))}
        </nav>
        <div className="mt-3 rounded-md border border-dashed border-border p-2 text-[10px] leading-snug text-muted-foreground">
          💡 Trade-Signale, Auswertungen, Aktie im Fokus, Marktupdates, Lexikon und Videos werden im jeweiligen Depot via <strong>Bearbeitungsmodus</strong> gepflegt.
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
