/**
 * Spec §9 — Mail- & Push-Templates. Phase 1: nur Vorschau im Admin-Backend.
 * Phase 2: Webhook-Versand → Trader IQ pflegt Mail-Strecke selbst (Zapier/n8n/Brevo).
 */

import { PRODUCT_LABELS } from "./login-status";
import type { ProductSlug } from "@traderiq/api";

export interface MailVars {
  vorname: string;
  productSlug: ProductSlug;
  deeplink: string;
}

export const MAIL_TEMPLATES = {
  tradeNew: (v: MailVars) => ({
    subject: `Neuer Trade im ${PRODUCT_LABELS[v.productSlug]}`,
    body: `Hey ${v.vorname}, im ${PRODUCT_LABELS[v.productSlug]} wurde gerade ein neuer Trade veröffentlicht. Klicke hier: ${v.deeplink}`,
  }),
  tradeClosed: (v: MailVars) => ({
    subject: `Trade geschlossen – ${PRODUCT_LABELS[v.productSlug]}`,
    body: `Hey ${v.vorname}, ein Trade im ${PRODUCT_LABELS[v.productSlug]} wurde geschlossen. Details findest du hier: ${v.deeplink}`,
  }),
  reportNew: (v: MailVars) => ({
    subject: `Neue Marktanalyse-PDF`,
    body: `Hey ${v.vorname}, eine neue Marktanalyse ist online. Direkt zum PDF: ${v.deeplink}`,
  }),
  editorial: (v: MailVars) => ({
    subject: `Wichtige Redaktionsmeldung`,
    body: `Hey ${v.vorname}, die Redaktion hat eine wichtige Meldung für dich. Hier lesen: ${v.deeplink}`,
  }),
} as const;

export const PUSH_TEMPLATES = {
  tradeNew: (v: MailVars) => ({
    title: `Neuer Trade · ${PRODUCT_LABELS[v.productSlug]}`,
    body: "Tippe für Details.",
  }),
  tradeClosed: (v: MailVars) => ({
    title: `Trade geschlossen · ${PRODUCT_LABELS[v.productSlug]}`,
    body: "Take-Profit / Stop-Out – jetzt ansehen.",
  }),
  reportNew: () => ({
    title: `Neue Marktanalyse`,
    body: "Frische PDF-Auswertung verfügbar.",
  }),
  mention: (v: MailVars) => ({
    title: `Du wurdest erwähnt`,
    body: "Tippe, um zur Diskussion zu springen.",
  }),
  editorial: () => ({
    title: `Redaktion · wichtig`,
    body: "Eine neue Meldung der Redaktion ist da.",
  }),
} as const;
