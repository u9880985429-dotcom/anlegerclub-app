/**
 * Oeffentliche API des ablefy-Moduls ("die Tuer").
 *
 * Vorerst nur der Konfig-Datenzugriff. In Stufe 5 kommen hier der gemeinsame
 * Ablefy-API-Client sowie die Webhook-/Sync-Logik dazu (heute noch in den
 * Route-Handlern verteilt).
 */

export { loadAblefyConfigFromDb, saveAblefyConfigToDb } from "./config-repository";
