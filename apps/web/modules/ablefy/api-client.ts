/**
 * ablefy-Modul · gemeinsamer HTTP-CLIENT fuer die Ablefy-REST-API
 * (https://api.myablefy.com/api/...).
 *
 * Vorher war exakt derselbe Aufruf in vier Route-Handlern kopiert
 * (test, lookup, sync, sync/preview): URL bauen, key+secret als Query-Param
 * setzen, mit `Accept: application/json` fetchen, Body als Text lesen und mit
 * Fallback durch `JSON.parse` schicken. Dieser Client kapselt genau diese
 * Mechanik — NICHT mehr und nicht weniger. Die routen-spezifische Behandlung
 * (Event-Logs, Response-Form, Fehlercodes) bleibt bewusst in den Routen.
 *
 * Konsumenten importieren ueber die Modul-Tuer `@/modules/ablefy`, nicht diese
 * Datei direkt.
 */

const ABLEFY_API_BASE = "https://api.myablefy.com/api";

export interface AblefyApiClientConfig {
  apiKey: string;
  apiSecret: string;
}

/** Ergebnis eines rohen GET-Aufrufs gegen die Ablefy-API. */
export interface AblefyRawResponse {
  /** Spiegelt `Response.ok` (HTTP-Status 2xx). */
  ok: boolean;
  /** HTTP-Statuscode der Upstream-Antwort. */
  status: number;
  /** Roher Antworttext (vor dem JSON-Parsen). */
  text: string;
  /**
   * Geparstes JSON oder `null`, wenn `JSON.parse` fehlschlug. Achtung:
   * Upstream kann legitim das JSON-Literal `null` liefern — dann ist `json`
   * ebenfalls `null`, aber `jsonOk` ist `true`. Konsumenten, die zwischen
   * "Parsen fehlgeschlagen" und "leeres JSON" unterscheiden muessen, pruefen
   * `jsonOk`.
   */
  json: unknown;
  /** `true`, wenn `JSON.parse(text)` ohne Fehler durchlief. */
  jsonOk: boolean;
}

export interface AblefyApiClient {
  /**
   * Fuehrt `GET {base}/{path}` aus. `apiKey`/`apiSecret` werden — in dieser
   * Reihenfolge — als `key`/`secret`-Query-Param gesetzt, danach die optionalen
   * `searchParams` (Reihenfolge wie uebergeben). Liefert Status, Rohtext und das
   * (optional geparste) JSON zurueck; wirft NUR bei Netzwerk-/fetch-Fehlern.
   */
  getRaw(path: string, searchParams?: Record<string, string>): Promise<AblefyRawResponse>;
}

/**
 * Baut die Upstream-URL identisch zur vorherigen Inline-Logik:
 * zuerst `key`, dann `secret`, dann die uebrigen Parameter in Einfuege-
 * Reihenfolge.
 */
function buildUrl(config: AblefyApiClientConfig, path: string, searchParams?: Record<string, string>): URL {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(`${ABLEFY_API_BASE}/${normalizedPath}`);
  url.searchParams.set("key", config.apiKey);
  url.searchParams.set("secret", config.apiSecret);
  if (searchParams) {
    for (const [name, value] of Object.entries(searchParams)) {
      url.searchParams.set(name, value);
    }
  }
  return url;
}

export function createAblefyApiClient(config: AblefyApiClientConfig): AblefyApiClient {
  return {
    async getRaw(path, searchParams) {
      const url = buildUrl(config, path, searchParams);
      const upstream = await fetch(url, { headers: { Accept: "application/json" } });
      const text = await upstream.text();
      let json: unknown = null;
      let jsonOk = true;
      try {
        json = JSON.parse(text);
      } catch {
        json = null;
        jsonOk = false;
      }
      return { ok: upstream.ok, status: upstream.status, text, json, jsonOk };
    },
  };
}
