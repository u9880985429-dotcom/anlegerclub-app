"use client";
import { RefreshCw, Download, Settings, Filter, Share2, Eye } from "lucide-react";
import { CardMenu, type CardMenuItem } from "@/components/CardMenu";

/**
 * Wrapper, damit Server-Komponenten den 3-Punkt-Menue nur per Label-Prop einsetzen.
 * (Function-Props koennen nicht ueber die Server/Client-Grenze gereicht werden.)
 */
export function KpiCardMenu({ label, variant = "chart" }: { label: string; variant?: "chart" | "metric" | "table" }) {
  const items: CardMenuItem[] = [
    { label: "Aktualisieren", icon: RefreshCw, onClick: () => alert(`„${label}" wird aktualisiert (Phase 2: DB-Refetch).`) },
    ...(variant !== "metric"
      ? [
          { label: "Als PNG exportieren", icon: Download, onClick: () => alert(`„${label}" als PNG (Phase 2).`) },
          { label: "Als CSV exportieren", icon: Download, onClick: () => alert(`„${label}" als CSV (Phase 2).`) },
        ]
      : [
          { label: "Verlauf ansehen", icon: Eye, onClick: () => alert(`Historie zu „${label}" oeffnen (Phase 2).`) },
        ]),
    { divider: true, label: "" },
    { label: "Zeitraum aendern", icon: Filter, onClick: () => alert("Zeitraum-Picker (Phase 2).") },
    { label: "Teilen / Snapshot", icon: Share2, onClick: () => alert("Snapshot-URL erstellen (Phase 2).") },
    { label: "Einstellungen", icon: Settings, onClick: () => alert("Einstellungen (Phase 2).") },
  ];
  return <CardMenu items={items} label={`Aktionen fuer ${label}`} />;
}
