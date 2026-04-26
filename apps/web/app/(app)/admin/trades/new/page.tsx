"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const ACTIONS = [
  { value: "NEUER_KAUF", label: "Neuer Kauf" },
  { value: "NEUER_VERKAUF", label: "Neuer Verkauf" },
  { value: "ANPASSUNG_STOP", label: "Anpassung Stop" },
  { value: "TAKE_PROFIT", label: "Take Profit" },
  { value: "NEUER_TRADE", label: "Neuer Trade" },
  { value: "GEFUELLT", label: "Gefüllt" },
  { value: "TEUER_TRADE", label: "Teurer Trade" },
];

export default function AdminTradeNewPage() {
  const [productSlug, setProductSlug] = useState("trend");
  const [date, setDate] = useState("");
  const [action, setAction] = useState("NEUER_KAUF");
  const [tickers, setTickers] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  function publish(e: React.FormEvent) {
    e.preventDefault();
    setStatus(`✓ Veröffentlicht (Mock). Push-Webhook + Mail-Webhook würden jetzt ausgelöst für ${productSlug}.`);
  }

  return (
    <>
      <Link href="/admin/trades" className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Zurück
      </Link>
      <PageHeader eyebrow="Trade-Signal" title="Neuen Trade veröffentlichen" />

      <form onSubmit={publish} className="card-base space-y-4 p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Depot">
            <select value={productSlug} onChange={(e) => setProductSlug(e.target.value)} className="input-base">
              <option value="starter">Starter</option>
              <option value="trend">Trend</option>
              <option value="stillhalter">Stillhalter</option>
              <option value="cockpit">Cockpit</option>
            </select>
          </Field>
          <Field label="Datum (TT.MM.JJJJ)">
            <input className="input-base" placeholder="07.04.2026" value={date} onChange={(e) => setDate(e.target.value)} required />
          </Field>
          <Field label="Aktion">
            <select value={action} onChange={(e) => setAction(e.target.value)} className="input-base">
              {ACTIONS.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Tickers (Komma-getrennt)">
          <input className="input-base font-mono" placeholder="AVGO, NVDA, MSFT" value={tickers} onChange={(e) => setTickers(e.target.value)} required />
        </Field>

        <Field label="Titel">
          <input className="input-base" placeholder="07.04.2026 Neuer Kauf, Anpassung Stops" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </Field>

        <Field label="Body (Markdown)">
          <textarea
            className="input-base h-40 resize-y"
            placeholder="**Neuer Kauf:** AVGO – Einstieg ..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
        </Field>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            Veröffentlichen → triggert <code className="font-mono">/api/notify/push-out</code> + <code className="font-mono">/api/notify/email-out</code>
          </p>
          <button type="submit" className="btn-brand inline-flex items-center gap-2">
            <Send className="h-4 w-4" /> Veröffentlichen
          </button>
        </div>

        {status && (
          <div className="rounded-md border border-profit/40 bg-profit/10 p-3 text-sm text-profit">{status}</div>
        )}
      </form>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
