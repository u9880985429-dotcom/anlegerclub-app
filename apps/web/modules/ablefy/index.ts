/**
 * Oeffentliche API des ablefy-Moduls ("die Tuer").
 *
 * Konfig-Datenzugriff plus der gemeinsame Ablefy-API-Client (Stufe 5). Die
 * Webhook-/Sync-Logik liegt noch in den Route-Handlern und wandert spaeter
 * hierher.
 */

export { loadAblefyConfigFromDb, saveAblefyConfigToDb } from "./config-repository";

// Geteilter Domaenen-Typ ueber die Modul-Tuer (statt dass andere Module direkt
// `@/lib/ablefy-config` importieren). So haengt z.B. das kpi-Modul nur an der
// ablefy-Tuer, nicht an lib-Interna. Die Datei wandert in der IT-Runde ins Modul.
export type { AblefyProductMapping } from "@/lib/ablefy-config";

export { createAblefyApiClient } from "./api-client";
export type { AblefyApiClient, AblefyApiClientConfig, AblefyRawResponse } from "./api-client";

export { runAblefySync } from "./sync-service";
export type {
  RunAblefySyncParams,
  AggregatedKpi,
  AblefySyncResult,
  AblefySyncOk,
  AblefySyncHttpError,
  AblefySyncFailure,
} from "./sync-service";

export {
  extractEventName,
  buildSummary,
  shouldTrackBuyer,
  extractBuyerInfo,
  safeCompare,
} from "./webhook-helpers";
export type { ExtractedBuyer } from "./webhook-helpers";
