/**
 * SignalTape — Signatur-Element der oeffentlichen Startseite.
 *
 * Zeigt ruhig und ledger-artig, wie ein Trade-Signal im Mitgliederbereich
 * aussieht: Datum im Format TT.MM.JJJJ + farbcodierte Aktion
 * (gruen = Kaufen/Gewinn, rot = Verkaufen, neutral = Halten/Stop).
 *
 * Bewusst KEIN Live-/Mock-Datenfeed, KEINE Animation ausser einem dezenten
 * Hover. Reine Server-Komponente: feste Beispielzeilen, damit die oeffentliche
 * Seite niemandem echte Signale verraet. Datumsformatierung ist hier inline
 * (nicht aus lib/format importiert), damit die Datei isoliert bleibt.
 */

type Tone = "buy" | "sell" | "neutral";

interface SignalRow {
  /** ISO-Datum — wird zu TT.MM.JJJJ formatiert. */
  date: string;
  instrument: string;
  /** Deutsches Aktions-Label, wie im Mitgliederbereich. */
  action: string;
  tone: Tone;
}

// Beispielzeilen — keine echten Signale, nur Schaufenster.
const ROWS: SignalRow[] = [
  { date: "2026-06-23", instrument: "Allianz", action: "Neuer Kauf", tone: "buy" },
  { date: "2026-06-19", instrument: "SAP", action: "Gewinn mitnehmen", tone: "buy" },
  { date: "2026-06-16", instrument: "Siemens", action: "Stop anpassen", tone: "neutral" },
  { date: "2026-06-11", instrument: "Rheinmetall", action: "Neuer Verkauf", tone: "sell" },
  { date: "2026-06-05", instrument: "Microsoft", action: "Position halten", tone: "neutral" },
];

function formatGermanDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Punkt + Label-Farbe pro Aktionstyp. Gewinn/Verlust nur dort, wo sie etwas bedeuten. */
const TONE: Record<Tone, { dot: string; label: string }> = {
  buy: { dot: "bg-profit", label: "text-emerald-300" },
  sell: { dot: "bg-loss", label: "text-red-300" },
  neutral: { dot: "bg-navy-400", label: "text-navy-200" },
};

export function SignalTape() {
  return (
    <div className="card-elevated overflow-hidden border-navy-800 bg-navy-900 text-navy-100">
      {/* Kopf des Panels — wie der Rand eines Terminals. */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
        <span className="font-display text-sm font-semibold tracking-tight text-white">
          Signal-Tape
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-navy-300">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-brand/70" />
          </span>
          Beispiel
        </span>
      </div>

      {/* Signal-Zeilen — Datum tabellarisch, Aktion farbcodiert. */}
      <ul className="divide-y divide-white/[0.06]">
        {ROWS.map((row) => {
          const tone = TONE[row.tone];
          return (
            <li
              key={`${row.date}-${row.instrument}`}
              className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.03] sm:gap-4"
            >
              <time
                dateTime={row.date}
                className="w-[5.5rem] shrink-0 font-mono text-xs tabular-nums text-navy-300 sm:text-sm"
              >
                {formatGermanDate(row.date)}
              </time>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
                {row.instrument}
              </span>
              <span className="inline-flex shrink-0 items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden />
                <span className={`text-xs font-semibold sm:text-sm ${tone.label}`}>
                  {row.action}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      {/* Fuss — erklaert das Format in einem Satz, technikfern. */}
      <div className="border-t border-white/10 px-5 py-3 text-[11px] leading-relaxed text-navy-300">
        So bekommst du jedes Signal: ein Datum, ein Wert, eine klare Aktion.
      </div>
    </div>
  );
}
