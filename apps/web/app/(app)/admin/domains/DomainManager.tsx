"use client";
import { useEffect, useState } from "react";
import { Globe, Plus, Trash2, CheckCircle2, AlertCircle, Copy } from "lucide-react";

interface DomainEntry {
  id: string;
  hostname: string;
  ip?: string;
  status: "verified" | "pending" | "failed";
  isPrimary: boolean;
  type: "primary" | "alias" | "redirect";
}

const DEFAULTS: DomainEntry[] = [
  { id: "d1", hostname: "member.traderiq.net", status: "verified", isPrimary: true, type: "primary" },
  { id: "d2", hostname: "www.member.traderiq.net", status: "verified", isPrimary: false, type: "redirect" },
  { id: "d3", hostname: "app.traderiq.net", status: "pending", isPrimary: false, type: "alias", ip: "" },
];

const STORAGE_KEY = "traderiq:domains";

export function DomainManager() {
  const [domains, setDomains] = useState<DomainEntry[]>(DEFAULTS);
  const [mounted, setMounted] = useState(false);
  const [newHost, setNewHost] = useState("");
  const [newIp, setNewIp] = useState("");
  const [newType, setNewType] = useState<DomainEntry["type"]>("alias");

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDomains(JSON.parse(raw));
    } catch {}
  }, []);

  function persist(next: DomainEntry[]) {
    setDomains(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function add() {
    if (!newHost.trim()) return;
    const entry: DomainEntry = {
      id: `d_${Date.now().toString(36)}`,
      hostname: newHost.trim(),
      ip: newIp.trim() || undefined,
      status: "pending",
      isPrimary: false,
      type: newType,
    };
    persist([...domains, entry]);
    setNewHost("");
    setNewIp("");
  }

  function remove(id: string) {
    if (!confirm("Domain wirklich entfernen?")) return;
    persist(domains.filter((d) => d.id !== id));
  }

  function setPrimary(id: string) {
    persist(domains.map((d) => ({ ...d, isPrimary: d.id === id, type: d.id === id ? "primary" : d.type === "primary" ? "alias" : d.type })));
  }

  function reverify(id: string) {
    persist(domains.map((d) => (d.id === id ? { ...d, status: "verified" } : d)));
  }

  function copy(text: string) {
    navigator.clipboard?.writeText(text);
  }

  if (!mounted) return null;

  return (
    <div className="space-y-3">
      {/* Liste */}
      <div className="card-base overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border bg-muted/40">
              <th className="px-3 py-2">Hostname</th>
              <th className="px-3 py-2">Typ</th>
              <th className="px-3 py-2">IP-Adresse</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {domains.map((d) => (
              <tr key={d.id} className="hover:bg-accent/40">
                <td className="px-3 py-2 font-mono">
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    <strong>{d.hostname}</strong>
                    {d.isPrimary && (
                      <span className="rounded-md bg-brand/15 px-1.5 py-0.5 text-[10px] font-semibold text-brand">PRIMARY</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 capitalize text-muted-foreground">{d.type}</td>
                <td className="px-3 py-2 font-mono text-muted-foreground">
                  {d.ip ? (
                    <button onClick={() => copy(d.ip!)} className="inline-flex items-center gap-1 hover:text-foreground" title="Kopieren">
                      {d.ip} <Copy className="h-3 w-3 opacity-60" />
                    </button>
                  ) : (
                    <span className="text-muted-foreground/60">— (CNAME)</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {d.status === "verified" ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-profit/15 px-1.5 py-0.5 text-[10px] font-semibold text-profit">
                      <CheckCircle2 className="h-3 w-3" /> Verifiziert
                    </span>
                  ) : d.status === "pending" ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                      <AlertCircle className="h-3 w-3" /> Ausstehend
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-loss/15 px-1.5 py-0.5 text-[10px] font-semibold text-loss">
                      <AlertCircle className="h-3 w-3" /> Fehlgeschlagen
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="inline-flex items-center gap-1">
                    {!d.isPrimary && (
                      <button onClick={() => setPrimary(d.id)} className="btn-ghost text-[11px]">
                        Als Primary
                      </button>
                    )}
                    {d.status !== "verified" && (
                      <button onClick={() => reverify(d.id)} className="btn-ghost text-[11px]">
                        Erneut pruefen
                      </button>
                    )}
                    <button onClick={() => remove(d.id)} className="btn-ghost text-[11px] text-destructive" aria-label="Domain entfernen">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add-Form */}
      <div className="card-base p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Neue Domain hinzufuegen</h3>
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr_140px_auto]">
          <label className="block text-xs">
            <span className="mb-1 block font-semibold">Hostname</span>
            <input
              className="input-base"
              placeholder="member.traderiq.net"
              value={newHost}
              onChange={(e) => setNewHost(e.target.value)}
            />
          </label>
          <label className="block text-xs">
            <span className="mb-1 block font-semibold">IP-Adresse (optional)</span>
            <input
              className="input-base font-mono"
              placeholder="z.B. 76.76.21.21 (oder leer = CNAME)"
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
            />
          </label>
          <label className="block text-xs">
            <span className="mb-1 block font-semibold">Typ</span>
            <select className="input-base" value={newType} onChange={(e) => setNewType(e.target.value as DomainEntry["type"])}>
              <option value="alias">Alias</option>
              <option value="redirect">Redirect</option>
              <option value="primary">Primary</option>
            </select>
          </label>
          <div className="flex items-end">
            <button onClick={add} disabled={!newHost.trim()} className="btn-brand inline-flex items-center gap-1">
              <Plus className="h-3.5 w-3.5" /> Hinzufuegen
            </button>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Phase 2: DNS-Verifizierung via TXT-Record (<code>_traderiq-verify</code>) + automatische Cloudflare-/Vercel-Rule-Erstellung. Bei IP-Leerlassen wird ein <code>CNAME</code> auf <code>cname.vercel-dns.com</code> empfohlen.
        </p>
      </div>
    </div>
  );
}
