/**
 * Server-sichere Metadaten der Rechtstexte (KEIN "use client").
 *
 * Diese Konstanten lagen frueher in der Client-Komponente `LegalDocumentEditor`.
 * Die Server-Seite `admin/legal/[slug]/page.tsx` liest aber `title`/`description`
 * davon — und ein Server-Component darf NICHT in ein Client-Modul "hineingreifen"
 * (RSC-Fehler: "Cannot access agb.title on the server"). Daher hier ausgelagert:
 * Server-Seite UND Client-Editor importieren beide aus dieser neutralen Datei.
 */

export type LegalSlug = "agb" | "impressum" | "datenschutz";

export const LEGAL_DOCS: Record<LegalSlug, { title: string; description: string; placeholder: string }> = {
  agb: {
    title: "Meine AGB",
    description: "Allgemeine Geschaeftsbedingungen — als PDF/Word hochladen oder direkt als Text einfuegen.",
    placeholder:
      "§1 Geltungsbereich\nDie nachfolgenden Allgemeinen Geschaeftsbedingungen (AGB) gelten fuer alle ueber traderiq.net abgeschlossenen Vertraege ...\n\n§2 Vertragsgegenstand\n...\n\n§3 Widerrufsbelehrung\n...",
  },
  impressum: {
    title: "Impressum",
    description: "Anbieterkennzeichnung gemaess §5 TMG. Pflicht-Informationen fuer alle gewerblichen Webseiten in DE.",
    placeholder:
      "Anbieter\nTrader IQ GmbH\nMusterstrasse 12\n10115 Berlin\n\nVertretungsberechtigt: Andrei [Nachname]\n\nKontakt\nTelefon: +49 ...\nE-Mail: info@traderiq.net\n\nRegistergericht: Amtsgericht Berlin-Charlottenburg\nRegisternummer: HRB ...\nUSt-IdNr.: DE ...",
  },
  datenschutz: {
    title: "Datenschutzerklaerung",
    description: "Wie Trader IQ personenbezogene Daten verarbeitet — DSGVO-konforme Information fuer User.",
    placeholder:
      "1. Verantwortlicher\nVerantwortlich fuer die Datenverarbeitung im Sinne der DSGVO ist:\nTrader IQ GmbH, Musterstrasse 12, 10115 Berlin ...\n\n2. Verarbeitung beim Besuch der App\n...\n\n3. Cookies und Tracking\n...\n\n4. Drittanbieter\n...",
  },
};
