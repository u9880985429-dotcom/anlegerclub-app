"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={className ?? "btn-ghost inline-flex items-center gap-2"}
    >
      <LogOut className="h-4 w-4" />
      <span>Abmelden</span>
    </button>
  );
}
