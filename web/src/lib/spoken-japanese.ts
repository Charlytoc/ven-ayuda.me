import type { VocabSegment } from "@/lib/vocabulary-types";

export function spokenJapaneseFromSegments(segments: VocabSegment[]): string {
  return segments.map((s) => s.text).join("").trim();
}
