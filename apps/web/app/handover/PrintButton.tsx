"use client";
import { Printer, Download } from "lucide-react";

export function PrintButton() {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand/90"
      >
        <Printer className="h-4 w-4" />
        Drucken / als PDF speichern
      </button>
      <a
        href="javascript:window.print()"
        className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent"
      >
        <Download className="h-4 w-4" />
        Als PDF
      </a>
    </div>
  );
}
