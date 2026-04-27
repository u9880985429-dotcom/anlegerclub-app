import Link from "next/link";
import { Bell, BellOff } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { requireSession } from "@/lib/access";
import { getNotificationsForUser } from "@traderiq/api";
import { formatRelative, formatGermanDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  "trade.new": "Neuer Trade",
  "trade.closed": "Trade geschlossen",
  "report.new": "Neue Auswertung",
  "community.mention": "Community-Erwähnung",
  editorial: "Redaktion",
};

export default async function NotificationsPage() {
  const session = await requireSession();
  const items = getNotificationsForUser(session.user.id);
  const unread = items.filter((n) => !n.readAt).length;

  return (
    <>
      <PageHeader
        eyebrow="Konto · Benachrichtigungen"
        title="Benachrichtigungen"
        description={`${items.length} Einträge · ${unread} ungelesen`}
        action={
          <Link href={"/settings" as never} className="btn-secondary inline-flex items-center gap-2">
            <Bell className="h-4 w-4" /> Einstellungen
          </Link>
        }
      />

      {items.length === 0 ? (
        <div className="card-base flex flex-col items-center justify-center p-12 text-center">
          <BellOff className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Keine Benachrichtigungen vorhanden.</p>
        </div>
      ) : (
        <div className="card-base divide-y divide-border">
          {items.map((n) => (
            <Link
              key={n.id}
              href={(n.deeplink ?? "#") as never}
              className="flex items-start gap-3 p-4 transition hover:bg-accent"
            >
              <div className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${n.readAt ? "bg-muted-foreground/40" : "bg-brand"}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold">{n.title}</span>
                  <span className="badge-base text-[10px]">{TYPE_LABEL[n.type] ?? n.type}</span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                <span className="mt-1 block text-[11px] text-muted-foreground">{formatGermanDateTime(n.createdAt)} · {formatRelative(n.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-md border border-dashed border-border p-4 text-xs text-muted-foreground">
        Phase 2: echte Push (Expo / FCM / APNs / VAPID) und Mail (Webhook → Zapier/n8n/Brevo).
        Aktuell zeigt diese Inbox die Mock-History für Demo-Zwecke.
      </div>
    </>
  );
}
