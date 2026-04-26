import { PageHeader } from "@/components/PageHeader";
import { MAIL_TEMPLATES, PUSH_TEMPLATES } from "@/lib/copy/notifications";
import { Mail, Bell } from "lucide-react";

export default function AdminNotificationsPage() {
  const sample = {
    vorname: "Max",
    productSlug: "trend" as const,
    deeplink: "https://anlegerclub-app.vercel.app/depot/trend",
  };

  return (
    <>
      <PageHeader
        eyebrow="Backend"
        title="Notification-Templates"
        description="Push-Titel/Body und Mail-Webhook-Payload-Vorschau (Spec §9 + §10.10)"
      />

      <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <Mail className="h-4 w-4" /> Mail-Templates
      </h2>
      <div className="card-base mb-8 divide-y divide-border">
        {Object.entries(MAIL_TEMPLATES).map(([key, fn]) => {
          const out = fn(sample);
          return (
            <div key={key} className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="badge-brand font-mono">{key}</span>
              </div>
              <div className="text-sm">
                <div className="text-xs text-muted-foreground">Subject:</div>
                <div className="font-semibold">{out.subject}</div>
                <div className="mt-2 text-xs text-muted-foreground">Body:</div>
                <p className="font-mono text-xs">{out.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <Bell className="h-4 w-4" /> Push-Templates
      </h2>
      <div className="card-base divide-y divide-border">
        {Object.entries(PUSH_TEMPLATES).map(([key, fn]) => {
          const out = fn(sample);
          return (
            <div key={key} className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="badge-brand font-mono">{key}</span>
              </div>
              <div className="text-sm">
                <div className="font-semibold">{out.title}</div>
                <p className="text-xs text-muted-foreground">{out.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-md border border-dashed border-border p-4 text-xs text-muted-foreground">
        Webhook-Endpoints: <code className="font-mono">POST /api/notify/email-out</code> und <code className="font-mono">POST /api/notify/push-out</code>.
        Phase 2: Trader IQ pflegt Mail-Strecke selbst (Zapier/n8n/Brevo); Push via Expo/FCM/APNs/VAPID.
      </div>
    </>
  );
}
