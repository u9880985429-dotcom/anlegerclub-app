import { redirect } from "next/navigation";
import { Type, Lock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { requireSession } from "@/lib/access";
import { FontManager } from "./FontManager";

export const dynamic = "force-dynamic";

export default async function FontsPage() {
  const session = await requireSession();
  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin · Konfiguration"
        title="Schriftarten"
        description="Eigene Web-Fonts hochladen, bearbeiten und im Default-Theme einsetzen."
      />

      <div className="mb-6 inline-flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-xs">
        <Lock className="mt-0.5 h-3.5 w-3.5 text-amber-700" />
        <span>
          <strong>Lizenzhinweis:</strong>{" "}
          Das Hochladen von Schriftarten, fuer die du keine Nutzungsrechte (Lizenzen) besitzt, verstoesst gegen geltendes Recht und die AGB. Lade nur Schriften hoch, fuer die du eine gueltige Web-Lizenz hast.
        </span>
      </div>

      <section>
        <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Type className="h-4 w-4 text-brand" /> Schriftarten-Bibliothek
        </h2>
        <FontManager />
      </section>
    </>
  );
}
