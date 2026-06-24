"use client";
import React from "react";

/**
 * Faengt Render-Fehler EINES Widgets ab, damit ein einzelnes kaputtes Widget
 * NICHT das ganze KPI-Dashboard (und damit das Admin-Backend) mit einer
 * "Application error: a client-side exception"-Seite lahmlegt. Stattdessen
 * erscheint nur an dieser Stelle eine kleine Fehlerkarte; alle anderen Widgets
 * + die Navigation funktionieren weiter.
 *
 * Hintergrund: Ohne Error-Boundary reisst eine geworfene Exception in EINEM
 * Widget den kompletten React-Baum mit (Next.js zeigt dann die generische
 * Fehlerseite). Diese Grenze isoliert jedes Widget einzeln.
 */
export class WidgetErrorBoundary extends React.Component<
  { children: React.ReactNode; widgetId?: string },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode; widgetId?: string }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): { hasError: boolean; message: string } {
    return { hasError: true, message: error instanceof Error ? error.message : "Render-Fehler" };
  }

  override componentDidCatch(error: unknown): void {
    // Sichtbar in der Konsole fuer Diagnose, ohne die Seite zu crashen.
    console.error("[widget-error]", this.props.widgetId, error);
  }

  override render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="card-base h-full border-loss/30 bg-loss/5 p-5">
          <div className="text-xs font-semibold text-loss">Widget konnte nicht geladen werden</div>
          <div className="mt-1 break-words text-xs text-muted-foreground">
            {this.props.widgetId ? <code>{this.props.widgetId}</code> : null}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Die uebrige Seite funktioniert normal. (Details in der Browser-Konsole.)
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
