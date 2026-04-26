"use client";
import { useState } from "react";
import { ChevronDown, Lock, AlertTriangle, ShieldCheck, UserCog, Mail } from "lucide-react";
import type { Role } from "@traderiq/api";

interface UserActionsMenuProps {
  userId: string;
  role: Role;
  currentStatus: string;
}

export function UserActionsMenu({ userId, role, currentStatus }: UserActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function fire(action: string) {
    setOpen(false);
    setToast(`(Mock) Aktion „${action}" auf User ${userId} ausgeführt.`);
    setTimeout(() => setToast(null), 3500);
  }

  const ACTIONS: { label: string; icon: React.ComponentType<{ className?: string }>; danger?: boolean }[] = [
    { label: "Account sperren", icon: Lock, danger: true },
    { label: "Abmahnung versenden", icon: AlertTriangle, danger: true },
    { label: "Auf Bezahlt-Status setzen (intern)", icon: ShieldCheck },
    { label: "Rolle ändern (Mitarbeiter, Mod, Admin)", icon: UserCog },
    { label: "Direktmail senden (info@traderiq.net)", icon: Mail },
  ];

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="btn-brand inline-flex items-center gap-2"
      >
        Aktionen <ChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-72 rounded-lg border border-border bg-popover p-2 shadow-lg">
          <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Aktuell: {role} · {currentStatus}
          </div>
          {ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                onClick={() => fire(a.label)}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition hover:bg-accent ${
                  a.danger ? "text-destructive" : ""
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{a.label}</span>
              </button>
            );
          })}
        </div>
      )}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-md border border-border bg-card px-4 py-3 text-sm shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
