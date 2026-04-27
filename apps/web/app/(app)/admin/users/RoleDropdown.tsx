"use client";
import { useEffect, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import type { Role } from "@traderiq/api";
import { canChangeRole } from "@traderiq/api";
import { getEffectiveRole, writeRoleOverride, clearRoleOverride } from "@/lib/role-overrides";

const OPTIONS: { value: Role; label: string }[] = [
  { value: "MEMBER", label: "Mitglied" },
  { value: "MODERATOR", label: "Moderator" },
  { value: "STAFF", label: "Mitarbeiter (Bezahlt)" },
  { value: "ADMIN", label: "Admin" },
  { value: "OWNER", label: "Owner / GF" },
];

interface RoleDropdownProps {
  initial: Role;
  userId: string;
  actorRole?: Role;
}

export function RoleDropdown({ initial, userId, actorRole }: RoleDropdownProps) {
  const [role, setRole] = useState<Role>(initial);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setRole(getEffectiveRole(userId, initial));
    function onChange(e: Event) {
      const detail = (e as CustomEvent<{ userId: string; role: Role | null }>).detail;
      if (detail.userId === userId) setRole(detail.role ?? initial);
    }
    window.addEventListener("traderiq:role-change", onChange as EventListener);
    return () => window.removeEventListener("traderiq:role-change", onChange as EventListener);
  }, [userId, initial]);

  function changeTo(newRole: Role) {
    if (newRole === role) { setOpen(false); return; }
    if (newRole === initial) clearRoleOverride(userId);
    else writeRoleOverride(userId, newRole);
    setRole(newRole);
    setOpen(false);
  }

  if (!mounted) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs">{initial}</span>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs hover:border-brand/40"
      >
        {role}
        {role !== initial && <span className="text-[9px] text-amber-700">(geändert)</span>}
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-1 w-56 overflow-hidden rounded-md border border-border bg-popover py-1 shadow-lg">
          {OPTIONS.map((opt) => {
            const allowed = !actorRole || canChangeRole(actorRole, role, opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                disabled={!allowed}
                onClick={() => allowed && changeTo(opt.value)}
                title={!allowed ? "Du hast nicht die nötigen Rechte für diese Rolle" : ""}
                className={`flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-xs transition ${
                  !allowed
                    ? "cursor-not-allowed text-muted-foreground/50"
                    : role === opt.value
                    ? "bg-brand/10 text-brand"
                    : "hover:bg-accent"
                }`}
              >
                <span>{opt.label}</span>
                {role === opt.value && <Check className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
