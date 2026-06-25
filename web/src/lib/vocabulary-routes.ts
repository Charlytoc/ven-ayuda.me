import type { VocabularyItem } from "@/lib/vocabulary-types";

export const VOCAB_ALL = "all";
export const VOCAB_UNCATEGORIZED = "uncategorized";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function isReservedCategoryDescriptor(descriptor: string): boolean {
  return descriptor === VOCAB_ALL || descriptor === VOCAB_UNCATEGORIZED;
}

export function vocabularyListPath(descriptor: string): string {
  return `/vocabulary/${descriptor}`;
}

export function vocabularyItemPath(categoryDescriptor: string, itemId: string): string {
  return `/vocabulary/${categoryDescriptor}/${itemId}`;
}

export function categoryDescriptorForItem(item: Pick<VocabularyItem, "category_id">): string {
  return item.category_id ?? VOCAB_UNCATEGORIZED;
}

export type CategoryFilter =
  | { kind: "all" }
  | { kind: "uncategorized" }
  | { kind: "category"; categoryId: string };

export function parseCategoryDescriptor(descriptor: string): CategoryFilter | null {
  if (descriptor === VOCAB_ALL) return { kind: "all" };
  if (descriptor === VOCAB_UNCATEGORIZED) return { kind: "uncategorized" };
  return null;
}

export function resolveCategoryFilter(
  descriptor: string,
  categoryIds: Iterable<string>,
): CategoryFilter | null {
  const reserved = parseCategoryDescriptor(descriptor);
  if (reserved) return reserved;
  const ids = new Set(categoryIds);
  if (isUuid(descriptor) && ids.has(descriptor)) {
    return { kind: "category", categoryId: descriptor };
  }
  return null;
}
