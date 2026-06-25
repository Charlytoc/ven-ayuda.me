import type { TFunction } from "i18next";

export function grammaticalCategoryLabel(t: TFunction, category: string): string {
  const key = `vocabulary.grammaticalCategories.${category}`;
  if (t(key) !== key) return t(key);
  return category;
}
