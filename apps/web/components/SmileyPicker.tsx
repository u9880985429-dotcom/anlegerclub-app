"use client";
import { useState } from "react";
import { Smile } from "lucide-react";
import { ALLOWED_REACTIONS } from "@traderiq/api";

interface SmileyPickerProps {
  onPick: (emoji: string) => void;
}

export function SmileyPicker({ onPick }: SmileyPickerProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition hover:border-brand/40 hover:text-brand"
        aria-label="Smiley einfügen"
        title="Smiley einfügen"
      >
        <Smile className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 z-30 mb-2 w-72 rounded-lg border border-border bg-popover p-2 shadow-lg">
          <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Erlaubte Reaktionen
          </div>
          <div className="grid grid-cols-10 gap-1">
            {ALLOWED_REACTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => {
                  onPick(e);
                  setOpen(false);
                }}
                className="rounded-md p-1.5 text-lg transition hover:bg-accent"
                aria-label={`Reaktion ${e}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
