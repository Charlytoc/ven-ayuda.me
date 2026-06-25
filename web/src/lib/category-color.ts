const MANTINE_CATEGORY_COLORS = [
  "blue",
  "cyan",
  "teal",
  "green",
  "lime",
  "yellow",
  "orange",
  "red",
  "pink",
  "grape",
  "violet",
  "indigo",
] as const;

type MantineCategoryColor = (typeof MANTINE_CATEGORY_COLORS)[number];

const VALID_COLORS = new Set<string>(MANTINE_CATEGORY_COLORS);

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function categoryDisplayColor(stored: string | undefined, seed: string): MantineCategoryColor {
  const normalized = (stored || "").trim().toLowerCase();
  if (VALID_COLORS.has(normalized)) {
    return normalized as MantineCategoryColor;
  }
  return MANTINE_CATEGORY_COLORS[hashSeed(seed) % MANTINE_CATEGORY_COLORS.length];
}

export function pickCategoryColor(seed: string): MantineCategoryColor {
  return categoryDisplayColor("", seed);
}
