"use client";
import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

export interface CardMenuItem {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

/**
 * Wiederverwendbares 3-Punkt-Dropdown für Karten, Charts, Listen-Reihen.
 * Phase 1: Demo-Aktionen (alert / console / no-op). Phase 2: echte Handler hinten dran.
 */
export function CardMenu({ items, label = "Aktionen" }: { items: CardMenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-8 z-30 w-56 overflow-hidden rounded-md border border-border bg-card shadow-lg"
        >
          {items.map((it, i) =>
            it.divider ? (
              <div key={`d-${i}`} className="my-1 border-t border-border" />
            ) : (
              <button
                key={`${it.label}-${i}`}
                type="button"
                role="menuitem"
                disabled={it.disabled}
                onClick={() => {
                  setOpen(false);
                  it.onClick?.();
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition ${
                  it.disabled
                    ? "cursor-not-allowed text-muted-foreground/60"
                    : it.destructive
                      ? "text-destructive hover:bg-destructive/10"
                      : "text-foreground hover:bg-accent"
                }`}
              >
                {it.icon && <it.icon className="h-3.5 w-3.5 flex-shrink-0" />}
                <span>{it.label}</span>
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
