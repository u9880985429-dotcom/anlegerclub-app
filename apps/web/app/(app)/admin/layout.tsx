import { redirect } from "next/navigation";
import { requireSession } from "@/lib/access";
import { AdminSidebar } from "./AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const role = session.user.role;
  if (role !== "STAFF" && role !== "SALES" && role !== "OWNER" && role !== "ADMIN") {
    redirect("/dashboard");
  }
  const isOwnerAdmin = role === "OWNER" || role === "ADMIN";

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="card-base h-fit p-3 lg:sticky lg:top-6">
        <AdminSidebar isOwnerAdmin={isOwnerAdmin} />
        <div className="mt-5 rounded-md border border-dashed border-border p-2 text-xs leading-snug text-muted-foreground">
          💡 Trade-Signale, Auswertungen, Aktie im Fokus, Marktupdates, Lexikon und Videos werden im jeweiligen Depot via <strong>Bearbeitungsmodus</strong> gepflegt.
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
