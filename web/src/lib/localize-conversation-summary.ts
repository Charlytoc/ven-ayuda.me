import type { TFunction } from "i18next";

const ANALYSIS_SECTION_KEYS = [
  "whatYouStudied",
  "whatWentWell",
  "areasToReinforce",
  "suggestedNextSteps",
] as const;

type AnalysisSectionKey = (typeof ANALYSIS_SECTION_KEYS)[number];

const HEADING_VARIANTS: Record<string, AnalysisSectionKey> = {
  "What you studied": "whatYouStudied",
  "What went well": "whatWentWell",
  "Areas to reinforce": "areasToReinforce",
  "Suggested next steps": "suggestedNextSteps",
  "Lo que estudiaste": "whatYouStudied",
  "Lo que salió bien": "whatWentWell",
  "Áreas a reforzar": "areasToReinforce",
  "Próximos pasos sugeridos": "suggestedNextSteps",
};

export function localizeConversationSummary(summary: string, t: TFunction): string {
  let result = summary;
  for (const [variant, key] of Object.entries(HEADING_VARIANTS)) {
    const localized = t(`chat.analysisSections.${key}`);
    result = result.replaceAll(`## ${variant}`, `## ${localized}`);
  }
  return result;
}

export function conversationSummaryPreview(summary: string, t: TFunction): string {
  const localized = localizeConversationSummary(summary, t);
  const body = localized
    .replace(/^## .+$/gm, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
  const firstLine = body.split("\n").find((line) => line.trim());
  return firstLine?.trim() ?? body.slice(0, 160);
}
