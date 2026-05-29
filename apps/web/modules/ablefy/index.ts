/**
 * Oeffentliche API des ablefy-Moduls ("die Tuer").
 *
 * Konfig-Datenzugriff plus der gemeinsame Ablefy-API-Client (Stufe 5). Die
 * Webhook-/Sync-Logik liegt noch in den Route-Handlern und wandert spaeter
 * hierher.
 */

export { loadAblefyConfigFromDb, saveAblefyConfigToDb } from "./config-repository";

export { createAblefyApiClient } from "./api-client";
export type { AblefyApiClient, AblefyApiClientConfig, AblefyRawResponse } from "./api-client";
