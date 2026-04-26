import { ExternalLink } from "lucide-react";
import { VTJ } from "@traderiq/api";

/**
 * Embedded Visual Trading Journal (SharePoint Excel viewer).
 * In Phase 2: zentral konfigurierbarer iframe-URL je Depot.
 */
export function VTJEmbed({ title }: { title: string }) {
  return (
    <div className="card-base overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-brand">Visual Trading Journal</div>
          <div className="text-sm font-semibold">{title}</div>
        </div>
        <a
          href={VTJ.affiliateUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary inline-flex items-center gap-2 text-xs"
        >
          Über VTJ
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      <div className="relative" style={{ paddingTop: "70%" }}>
        <iframe
          src="https://traderiq.sharepoint.com/:x:/s/4Technologie/EaO_ZQdHboxPmcYUqFPoTfUBsL9v8zx4xU3Y8JFkXdmPeg?e=ZDdRB8&action=embedview&wdbipreview=true&Item=depotstart&wdHideSheetTabs=true&wdHideHeaders=true&AllowInteractivity=false"
          title={title}
          frameBorder={0}
          className="absolute inset-0 h-full w-full bg-white"
          allowFullScreen
        />
      </div>
      <div className="border-t border-border bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">
        Aktuelle Live-Daten direkt aus unserer Excel/SharePoint-Quelle. Auf einigen Geräten ggf. SharePoint-Login nötig.
      </div>
    </div>
  );
}
