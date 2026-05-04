"use client";

import { Mail } from "lucide-react";

const APP_URL = "https://anlegerclub-app-web.vercel.app";

/**
 * "Einladen"-Knopf in der Admin-Mitgliederliste.
 *
 * Phase 1 (heute): Knopf oeffnet das System-Mailprogramm mit einer
 * vorgefertigten Einladungs-Mail an die Kunden-E-Mail-Adresse — der
 * Owner verschickt sie selber.
 *
 * Phase 2 (spaeter, sobald ein Mailtool angebunden ist): direkter
 * Versand ueber Postmark / Resend / SES, mit echtem Tracking.
 */
export function InviteCustomerButton({ email, firstName }: { email: string; firstName: string | null }) {
  function buildMailto(): string {
    const subject = encodeURIComponent("Dein Zugang zum Trader IQ Anlegerclub");
    const greeting = firstName ? `Hallo ${firstName},` : "Hallo,";
    const body = encodeURIComponent(
      `${greeting}\n\nschoen, dass du dabei bist! Dein Zugang zum Trader IQ Anlegerclub steht ab sofort bereit.\n\n` +
        `So richtest du dein Konto ein:\n\n` +
        `1. Geh auf ${APP_URL}/login\n` +
        `2. Gib genau diese E-Mail-Adresse ein (${email}) — damit findet das System deinen Ablefy-Kauf\n` +
        `3. Vergib ein Passwort\n` +
        `4. Bestaetige per SMS-Code (kommt direkt aufs Handy)\n` +
        `5. Fertig — du landest direkt im Anlegerclub-Dashboard\n\n` +
        `Falls du Fragen hast, antworte einfach auf diese Mail.\n\n` +
        `Viel Erfolg beim Handeln!\n\n` +
        `Dein Trader-IQ-Team\n${APP_URL}`,
    );
    return `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`;
  }

  return (
    <a
      href={buildMailto()}
      className="btn-secondary inline-flex items-center gap-1 text-xs"
      title="Oeffnet dein Mailprogramm mit einer vorbereiteten Einladungs-Mail an diesen Kunden."
    >
      <Mail className="h-3 w-3" /> Einladen
    </a>
  );
}
