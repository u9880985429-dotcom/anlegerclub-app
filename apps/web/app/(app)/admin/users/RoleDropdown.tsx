"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Role } from "@traderiq/api";

const OPTIONS: Role[] = ["MEMBER", "MODERATOR", "ADMIN", "STAFF", "OWNER"];

export function RoleDropdown({ initial, userId }: { initial: Role; userId: string }) {
  const [role, setRole] = useState<Role>(initial);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs hover:border-brand/40"
      >
        {role}
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-1 w-44 rounded-md border border-border bg-popover py-1 shadow-lg">
          {OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => {
                setRole(r);
                setOpen(false);
                console.info(`[admin] role-change user ${userId}: ${role} → ${r}`);
              }}
              className={`block w-full px-3 py-1.5 text-left text-xs hover:bg-accent ${role === r ? "bg-brand/10 text-brand" : ""}`}
            >
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
