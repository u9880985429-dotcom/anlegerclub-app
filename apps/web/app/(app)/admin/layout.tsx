import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/access";
import { Users, ShieldCheck, Crown } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
}

interface NavGroup {
  title: string;
  /** Wenn gesetzt, ist die ganze Gruppe nur fuer OWNER+ADMIN sichtbar. */
  ownerAdminOnly?: boolean;
  /** Optional: Sub-Gruppe (z.B. „Technisches Setup" innerhalb des Admin-Backends). */
  subgroups?: { title: string; items: NavItem[] }[];
  items?: NavItem[];
  icon: React.ComponentType<{ className?: string }>;
}

const NAV: NavGroup[] = [
  {
    title: "Mitarbeiter-Backend",
    icon: Users,
    items: [
      { href: "/admin", label: "Übersicht" },
      { href: "/admin/users", label: "Mitglieder" },
      { href: "/admin/subscriptions", label: "Subscriptions & Einladungen" },
      { href: "/admin/community", label: "Community-Moderation" },
      { href: "/admin/audit", label: "Audit-Log" },
    ],
  },
  {
    title: "Admin-Backend",
    icon: ShieldCheck,
    ownerAdminOnly: true,
    items: [
      { href: "/admin/kpi", label: "KPI-Dashboard" },
    ],
    subgroups: [
      {
        title: "Technisches Setup",
        items: [
          { href: "/admin/integrations", label: "Integrationen" },
          { href: "/admin/email-config", label: "E-Mail-Konfiguration" },
          { href: "/admin/domains", label: "Domains & SSL" },
          { href: "/admin/logs", label: "Datenlogs" },
          { href: "/admin/cookies", label: "Cookies & Einwilligungen" },
          { href: "/admin/fonts", label: "Schriftarten" },
          { href: "/admin/legal/agb", label: "Meine AGB" },
          { href: "/admin/legal/impressum", label: "Impressum" },
          { href: "/admin/legal/datenschutz", label: "Datenschutzerklärung" },
        ],
      },
    ],
  },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const role = session.user.role;
  if (role !== "STAFF" && role !== "SALES" && role !== "OWNER" && role !== "ADMIN") {
    redirect("/dashboard");
  }
  const isOwnerAdmin = role === "OWNER" || role === "ADMIN";
  const visibleGroups = NAV.filter((g) => !g.ownerAdminOnly || isOwnerAdmin);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="card-base h-fit p-3 lg:sticky lg:top-6">
        <nav className="space-y-5 text-sm">
          {visibleGroups.map((group) => {
            const GroupIcon = group.icon;
            return (
              <div key={group.title}>
                <div
                  className={`mb-2 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wider ${
                    group.ownerAdminOnly ? "text-brand" : "text-muted-foreground"
                  }`}
                >
                  <GroupIcon className="h-3.5 w-3.5" />
                  {group.title}
                  {group.ownerAdminOnly && <Crown className="ml-auto h-3 w-3" />}
                </div>

                {group.items && (
                  <div className="space-y-0.5">
                    {group.items.map((it) => (
                      <Link
                        key={it.href}
                        href={it.href as never}
                        className={`block rounded-md px-3 py-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground ${
                          group.ownerAdminOnly ? "border border-brand/20 bg-brand/5" : ""
                        }`}
                      >
                        {it.label}
                      </Link>
                    ))}
                  </div>
                )}

                {group.subgroups?.map((sub) => (
                  <div key={sub.title} className="mt-3">
                    <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {sub.title}
                    </div>
                    <div className="space-y-0.5">
                      {sub.items.map((it) => (
                        <Link
                          key={it.href}
                          href={it.href as never}
                          className="block rounded-md border border-brand/15 bg-brand/[0.03] px-3 py-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                        >
                          {it.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </nav>
        <div className="mt-5 rounded-md border border-dashed border-border p-2 text-[10px] leading-snug text-muted-foreground">
          💡 Trade-Signale, Auswertungen, Aktie im Fokus, Marktupdates, Lexikon und Videos werden im jeweiligen Depot via <strong>Bearbeitungsmodus</strong> gepflegt.
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
