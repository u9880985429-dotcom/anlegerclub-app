import type { MonthlyReport, ProductSlug } from "../types";

const MONTHS_DESC = [
  "Februar & März 2026",
  "Januar 2026",
  "Dezember 2025",
  "November 2025",
  "Oktober 2025",
  "September 2025",
  "August 2025",
  "Juli 2025",
  "Juni 2025",
  "Mai 2025",
  "April 2025",
  "März 2025",
  "Februar 2025",
  "Januar 2025",
];

function buildReports(slug: ProductSlug): MonthlyReport[] {
  return MONTHS_DESC.map((label, i) => ({
    id: `mr_${slug}_${i}`,
    productSlug: slug,
    monthLabel: label,
    videoAssetId: `mux_demo_${slug}_${i}`,
    pdfUrl: i < 3 ? `/mock/reports/${slug}-${i}.pdf` : null,
    bodyMd: `### Auswertung ${label}\n\nIm Berichtszeitraum erzielte das **${slug}-Depot** eine Performance, die der Marktrichtung folgt. Highlights:\n\n- Trade-Quote ${65 + (i % 10)}%\n- Größter Gewinner: +${12 + (i % 8)}%\n- Größter Verlierer: −${3 + (i % 4)}%\n\nDie Strategie bleibt unverändert: Trends früh mitnehmen, Verluste konsequent begrenzen.`,
    publishedAt: `2026-${String(13 - Math.min(13, i)).padStart(2, "0")}-01T08:00:00Z`,
  }));
}

export const trendReports = buildReports("trend");
export const stillhalterReports = buildReports("stillhalter");
export const starterReports = buildReports("starter");
export const cockpitReports = buildReports("cockpit");

export function getReportsByProduct(slug: string): MonthlyReport[] {
  switch (slug) {
    case "trend":
      return trendReports;
    case "stillhalter":
      return stillhalterReports;
    case "starter":
      return starterReports;
    case "cockpit":
      return cockpitReports;
    default:
      return [];
  }
}
