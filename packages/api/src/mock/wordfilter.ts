/**
 * Wortfilter für Community-Posts (Spec §10).
 * Pattern werden case-insensitive geprüft, mit Stern-Maskierung ersetzt
 * und ein Report im Admin-Backend angelegt.
 *
 * Phase 2: erweiterbar via Admin-UI; intelligente Erkennung via KI-Klassifikation.
 */

// Beleidigungen (DACH + EN). Bewusst kuratierter Starter-Set;
// die Kunden-Moderation pflegt das in Phase 2 nach.
export const PROFANITY_WORDS: string[] = [
  // DACH
  "arschloch", "arschlöcher", "wichser", "hurensohn", "hure", "schlampe",
  "kanake", "missgeburt", "vollidiot", "schwachkopf", "schwachsinniger",
  "bastard", "drecksack", "drecksau", "spasti", "behindert",
  // EN
  "asshole", "motherfucker", "fucker", "bitch", "cunt", "bastard",
  "retard", "fag", "faggot", "nigger", "whore",
];

// Werbung / Eigenwerbung — Patterns, die typischerweise auf Promo hinweisen.
export const PROMO_PATTERNS: string[] = [
  // URL-Indikatoren
  "http://", "https://www.", "telegram.me", "t.me/",
  "whatsapp.com/channel", "discord.gg",
  // Kauf-/Promo-Sprache
  "jetzt anmelden", "klick hier", "click here",
  "100% rendite", "risikolos verdienen",
  "garantierte rendite", "guaranteed returns",
  "follow my", "schreib mir privat", "dm me",
  // Konkurrenz-Brand-Mentions (Beispiele — Liste pflegen)
  "scalable", "trade republic", "etoro", "trading 212",
];

export interface FilterResult {
  cleaned: string;
  flaggedProfanity: string[];
  flaggedPromo: string[];
  blocked: boolean;
}

function maskWord(w: string): string {
  if (w.length <= 2) return "*".repeat(w.length);
  return w[0] + "*".repeat(w.length - 2) + w[w.length - 1];
}

export function filterText(input: string): FilterResult {
  let cleaned = input;
  const flaggedProfanity: string[] = [];
  const flaggedPromo: string[] = [];

  for (const word of PROFANITY_WORDS) {
    const re = new RegExp(`\\b${word}\\b`, "gi");
    if (re.test(cleaned)) {
      flaggedProfanity.push(word);
      cleaned = cleaned.replace(re, (m) => maskWord(m));
    }
  }

  const lower = input.toLowerCase();
  for (const pat of PROMO_PATTERNS) {
    if (lower.includes(pat.toLowerCase())) {
      flaggedPromo.push(pat);
    }
  }

  // Promo-Verdacht → Post wird BLOCKIERT (Spec §10: "automatisch beim absenden blockieren")
  // Beleidigungen → Post wird gepostet, aber maskiert + intern geflaggt
  return {
    cleaned,
    flaggedProfanity,
    flaggedPromo,
    blocked: flaggedPromo.length > 0,
  };
}

// Erlaubte Reaktions-Smileys (Spec §10 explizit gelistet)
export const ALLOWED_REACTIONS: string[] = [
  "💪", "✅", "😝", "😎", "🤌🏼", "😂", "🤙🏼", "🔁", "🥰", "😊",
  "😃", "😆", "🥹", "😍", "😜", "😛", "🤩", "🥸", "😏", "🥵",
  "🤗", "🫠", "🫶", "🤲", "🤝", "👍", "✌️", "👌", "🙏", "👂",
  "👨‍💻", "🧑‍💻", "👩‍💻", "🦁", "🐻", "🦬", "🌟", "✨", "🌞", "📈",
  "📉", "❌", "⭕️", "⛔️",
];
