"use client";
import { Download, Printer } from "lucide-react";

export function PrintButton() {
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => window.print()} className="btn-secondary inline-flex items-center gap-2">
        <Printer className="h-4 w-4" /> Drucken
      </button>
      <button onClick={() => window.print()} className="btn-brand inline-flex items-center gap-2">
        <Download className="h-4 w-4" /> Als PDF speichern
      </button>
    </div>
  );
}
