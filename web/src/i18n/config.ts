export const SUPPORTED_UI_LOCALES = ["en", "es"] as const;

export type UiLocale = (typeof SUPPORTED_UI_LOCALES)[number];

export function resolveUiLocale(nativeLanguage: string | null | undefined): UiLocale {
  const lang = (nativeLanguage ?? "").trim().toLowerCase().slice(0, 2);
  if (lang === "es") return "es";
  return "en";
}

export function browserUiLocale(): UiLocale {
  if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("es")) {
    return "es";
  }
  return "en";
}
