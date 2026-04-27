"use client";
import { useEffect, useState } from "react";
import { ChevronDown, Lock, AlertTriangle, ShieldCheck, UserCog, Mail, Check } from "lucide-react";
import type { Role } from "@traderiq/api";
import { canKick, canChangeRole } from "@traderiq/api";
import { getEffectiveRole, writeRoleOverride } from "@/lib/role-overrides";

interface UserActionsMenuProps {
  userId: string;
  role: Role;
  currentStatus: string;
  /** Rolle des Aufrufers — entscheidet welche Aktionen sichtbar sind. */
  actorRole?: Role;
}

const ROLE_OPTIONS: { value: Role; label: string; rights: string }[] = [
  { value: "MEMBER", label: "Mitglied", rights: "Standard-Zugriff auf eigene Depots" },
  { value: "MODERATOR", label: "Moderator", rights: "+ Posts verstecken, Reports bearbeiten" },
  { value: "ADMIN", label: "Admin", rights: "+ Inhalte bearbeiten, Mitglieder verwalten" },
  { value: "STAFF", label: "Mitarbeiter (Bezahlt)", rights: "+ alle Depots gratis (PAID-Status)" },
  { value: "OWNER", label: "Owner / GF", rights: "Vollzugriff auf alles inkl. Audit-Log" },
];

export function UserActionsMenu({ userId, role, currentStatus, actorRole }: UserActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role>(role);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setCurrentRole(getEffectiveRole(userId, role));
  }, [userId, role]);

  function fire(action: string) {
    setOpen(false);
    setToast(`(Mock) Aktion „${action}" auf User ${userId} ausgeführt.`);
    setTimeout(() => setToast(null), 3500);
  }

  function changeRole(newRole: Role) {
    setCurrentRole(newRole);
    writeRoleOverride(userId, newRole);
    setRoleOpen(false);
    setOpen(false);
    setToast(`Rolle geändert auf „${newRole}" – persistiert. User wurde benachrichtigt.`);
    setTimeout(() => setToast(null), 4000);
  }

  const canKickThis = !actorRole || canKick(actorRole, currentRole);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => {
          setOpen(!open);
          setRoleOpen(false);
        }}
        className="btn-brand inline-flex items-center gap-2"
      >
        Aktionen <ChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-lg border border-border bg-popover p-2 shadow-lg">
          <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Aktuell: {currentRole} · {currentStatus}
          </div>

          {/* Rolle ändern – Sub-Dropdown */}
          <div className="border-b border-border pb-2">
            <button
              onClick={() => setRoleOpen(!roleOpen)}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition hover:bg-accent"
            >
              <span className="inline-flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                Rolle ändern
              </span>
              <ChevronDown className={`h-3.5 w-3.5 transition ${roleOpen ? "rotate-180" : ""}`} />
            </button>
            {roleOpen && (
              <div className="mt-1 space-y-1 rounded-md border border-border bg-card p-1">
                {ROLE_OPTIONS.map((r) => {
                  const allowed = !actorRole || canChangeRole(actorRole, currentRole, r.value);
                  return (
                    <button
                      key={r.value}
                      onClick={() => allowed && changeRole(r.value)}
                      disabled={!allowed}
                      title={!allowed ? "Nicht genug Rechte für diese Rolle" : ""}
                      className={`flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-xs transition ${
                        !allowed
                          ? "cursor-not-allowed opacity-50"
                          : currentRole === r.value
                          ? "bg-brand/10 text-brand"
                          : "hover:bg-accent"
                      }`}
                    >
                      <span className="mt-0.5 h-3 w-3 flex-shrink-0">
                        {currentRole === r.value && <Check className="h-3 w-3" />}
                      </span>
                      <span>
                        <span className="font-semibold">{r.label}</span>
                        <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">{r.rights}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => canKickThis && fire("Account sperren")}
            disabled={!canKickThis}
            title={canKickThis ? "" : "Du hast nicht die Rechte, diesen User zu sperren"}
            className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition ${
              canKickThis ? "text-destructive hover:bg-accent" : "cursor-not-allowed text-muted-foreground/50"
            }`}
          >
            <Lock className="h-4 w-4" /> Account sperren
          </button>
          <button
            onClick={() => fire("Abmahnung versenden")}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-destructive transition hover:bg-accent"
          >
            <AlertTriangle className="h-4 w-4" /> Abmahnung versenden
          </button>
          <button
            onClick={() => fire("Auf Bezahlt-Status setzen (intern)")}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition hover:bg-accent"
          >
            <ShieldCheck className="h-4 w-4" /> Auf Bezahlt-Status setzen
          </button>
          <button
            onClick={() => fire("Direktmail senden")}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition hover:bg-accent"
          >
            <Mail className="h-4 w-4" /> Direktmail senden (info@traderiq.net)
          </button>
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
