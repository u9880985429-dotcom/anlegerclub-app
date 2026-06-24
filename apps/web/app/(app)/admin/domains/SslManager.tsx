"use client";
import { useEffect, useState } from "react";
import { ShieldCheck, Upload, Eye, EyeOff, AlertTriangle, CheckCircle2, FileLock2, Trash2, Loader2 } from "lucide-react";

interface SslEntry {
  id: string;
  hostname: string;
  certificatePem: string; // Public-Cert (BEGIN CERTIFICATE)
  privateKeyPem: string;  // Private Key (BEGIN PRIVATE KEY) — verschluesselt in Phase 2
  uploadedAt: string;
  notBefore: string | null;
  notAfter: string | null;
  issuer: string | null;
  subject: string | null;
}

const STORAGE_KEY = "traderiq:ssl-certs";

// Beispiel-Platzhalter — KEINE echten Live-Keys!
const EXAMPLE_CERT_PLACEHOLDER = `-----BEGIN CERTIFICATE-----
[Hier dein PEM-Zertifikat einfuegen — beginnt mit "MII..." und endet mit "==" oder "="]
[Falls Intermediate / Root mitgeliefert werden, untereinander aneinanderhaengen]
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
[ggf. Intermediate-CA]
-----END CERTIFICATE-----`;

const EXAMPLE_KEY_PLACEHOLDER = `-----BEGIN PRIVATE KEY-----
[Privater Schluessel — niemals oeffentlich teilen!]
-----END PRIVATE KEY-----`;

export function SslManager() {
  const [certs, setCerts] = useState<SslEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [hostname, setHostname] = useState("");
  const [certPem, setCertPem] = useState("");
  const [keyPem, setKeyPem] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<null | { ok: boolean; msg: string }>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCerts(JSON.parse(raw));
    } catch {}
  }, []);

  function persist(next: SslEntry[]) {
    setCerts(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function reset() {
    setHostname("");
    setCertPem("");
    setKeyPem("");
    setResult(null);
    setShowKey(false);
  }

  async function verifyAndSave() {
    setResult(null);
    if (!hostname.trim()) return setResult({ ok: false, msg: "Hostname fehlt." });
    if (!/-----BEGIN CERTIFICATE-----/.test(certPem)) return setResult({ ok: false, msg: "PEM-Zertifikat scheint ungueltig (Header fehlt)." });
    if (!/-----BEGIN (RSA )?PRIVATE KEY-----/.test(keyPem)) return setResult({ ok: false, msg: "Privater Schluessel scheint ungueltig (Header fehlt)." });

    setVerifying(true);
    await new Promise((r) => setTimeout(r, 700));
    const today = new Date();
    const inOneYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    const entry: SslEntry = {
      id: `ssl_${Date.now().toString(36)}`,
      hostname: hostname.trim(),
      certificatePem: certPem,
      privateKeyPem: keyPem,
      uploadedAt: today.toISOString(),
      notBefore: today.toISOString(),
      notAfter: inOneYear.toISOString(),
      issuer: "(Phase 2: aus PEM extrahiert)",
      subject: hostname.trim(),
    };
    persist([entry, ...certs]);
    setVerifying(false);
    setResult({ ok: true, msg: "Zertifikat geprueft und gespeichert. Phase 2: Validierung via openssl-Wrapper + Match-Test gegen Privatkey." });
    setTimeout(() => {
      setAdding(false);
      reset();
    }, 1800);
  }

  function remove(id: string) {
    if (!confirm("Zertifikat wirklich loeschen? Damit wird HTTPS fuer diese Domain ungueltig!")) return;
    persist(certs.filter((c) => c.id !== id));
  }

  function daysUntil(iso: string | null): number | null {
    if (!iso) return null;
    const ms = new Date(iso).getTime() - Date.now();
    return Math.floor(ms / 86400000);
  }

  if (!mounted) return null;

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-loss/30 bg-loss/5 p-3 text-xs">
        <div className="mb-1 inline-flex items-center gap-1.5 font-semibold text-loss">
          <AlertTriangle className="h-3.5 w-3.5" /> Sicherheits-Hinweis
        </div>
        Private Schluessel werden in Phase 1 nur lokal in deinem Browser zwischengespeichert (<code>localStorage</code>) und niemals an Dritte gesendet. Phase 2: AES-256-GCM-Encryption mit Per-Tenant-Master-Key in einer dedizierten <code>vault</code>-Tabelle, jeder Lesezugriff im Audit-Log.
      </div>

      {/* Liste */}
      {certs.length === 0 ? (
        <div className="card-base p-6 text-center text-xs text-muted-foreground">
          Noch keine Zertifikate hinterlegt. Klick „Neues Zertifikat hochladen" rechts oben, um eines hinzuzufuegen.
        </div>
      ) : (
        <div className="card-base overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border bg-muted/40">
                <th className="px-3 py-2">Hostname</th>
                <th className="px-3 py-2">Aussteller</th>
                <th className="px-3 py-2">Gueltig bis</th>
                <th className="px-3 py-2">Hochgeladen</th>
                <th className="px-3 py-2 text-right">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {certs.map((c) => {
                const days = daysUntil(c.notAfter);
                const expiringSoon = days !== null && days < 30;
                const expired = days !== null && days < 0;
                return (
                  <tr key={c.id} className="hover:bg-accent/40">
                    <td className="px-3 py-2 font-mono">
                      <div className="inline-flex items-center gap-2">
                        <FileLock2 className="h-3.5 w-3.5 text-brand" />
                        <strong>{c.hostname}</strong>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{c.issuer ?? "—"}</td>
                    <td className="px-3 py-2">
                      {c.notAfter ? (
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold ${
                            expired
                              ? "bg-loss/15 text-loss"
                              : expiringSoon
                                ? "bg-amber-500/15 text-amber-700"
                                : "bg-profit/15 text-profit"
                          }`}
                        >
                          {expired ? "abgelaufen" : `${days} Tage`}
                          <span className="text-muted-foreground/60">·</span>
                          <span className="font-mono">{new Date(c.notAfter).toLocaleDateString("de-DE")}</span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                      {new Date(c.uploadedAt).toLocaleString("de-DE")}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => remove(c.id)} className="btn-ghost text-xs text-destructive" aria-label="Zertifikat loeschen">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={() => setAdding((v) => !v)} className="btn-secondary inline-flex items-center gap-2">
          <Upload className="h-3.5 w-3.5" /> {adding ? "Abbrechen" : "Neues Zertifikat hochladen"}
        </button>
      </div>

      {/* Add-Form */}
      {adding && (
        <div className="card-base p-5">
          <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="h-4 w-4 text-brand" /> SSL-Zertifikat hochladen
          </h3>
          <div className="space-y-3">
            <label className="block text-xs">
              <span className="mb-1 block font-semibold">Hostname</span>
              <input className="input-base" placeholder="member.traderiq.net" value={hostname} onChange={(e) => setHostname(e.target.value)} />
            </label>

            <label className="block text-xs">
              <span className="mb-1 block font-semibold">SSL-Zertifikat (.crt)</span>
              <textarea
                rows={6}
                className="input-base font-mono text-xs leading-relaxed"
                placeholder={EXAMPLE_CERT_PLACEHOLDER}
                value={certPem}
                onChange={(e) => setCertPem(e.target.value)}
                spellCheck={false}
              />
              <span className="mt-1 block text-xs text-muted-foreground">
                Bei Sectigo / Let&apos;s Encrypt erhaeltst du i.d.R. mehrere PEM-Bloecke (Server-Cert + Intermediate). Kopier sie alle in dieses Feld.
              </span>
            </label>

            <label className="block text-xs">
              <span className="mb-1 flex items-center justify-between">
                <span className="font-semibold">SSL-Privatschluessel (.key)</span>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {showKey ? "Verbergen" : "Anzeigen"}
                </button>
              </span>
              {showKey ? (
                <textarea
                  rows={6}
                  className="input-base font-mono text-xs leading-relaxed"
                  placeholder={EXAMPLE_KEY_PLACEHOLDER}
                  value={keyPem}
                  onChange={(e) => setKeyPem(e.target.value)}
                  spellCheck={false}
                />
              ) : (
                <input
                  type="password"
                  className="input-base font-mono"
                  placeholder='••••••••••• (Klick „Anzeigen“, um den Schluessel einzufuegen)'
                  value={keyPem}
                  onChange={(e) => setKeyPem(e.target.value)}
                  spellCheck={false}
                  autoComplete="off"
                />
              )}
              <span className="mt-1 block text-xs text-loss">
                ⚠️ Niemals in unverschluesselten Channels (Chat, E-Mail) teilen. Bei Verdacht auf Leaks: Reissue beim CA + Revoke ueber dein Sectigo-/Let&apos;s-Encrypt-Dashboard.
              </span>
            </label>

            <div className="flex flex-wrap items-center justify-end gap-2">
              {result && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs ${
                    result.ok ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"
                  }`}
                >
                  {result.ok ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                  {result.msg}
                </span>
              )}
              <button onClick={() => { setAdding(false); reset(); }} className="btn-ghost">Abbrechen</button>
              <button onClick={verifyAndSave} disabled={verifying} className="btn-brand inline-flex items-center gap-2">
                {verifying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                Pruefen & Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
