export type VocabSegment = {
  text: string;
  furigana?: string | null;
};

export type GeneratedPhrase = {
  segments: VocabSegment[];
  meaning: string;
  explanation?: string;
};

export type VocabularyCategory = {
  id: string;
  name: string;
  color: string;
  ordering: number;
};

export type ReadingEntry = {
  reading: string;
  segments: VocabSegment[];
  meaning: string;
};

export type VocabularyExtra = {
  onyomi?: ReadingEntry[];
  kunyomi?: ReadingEntry[];
  jlpt?: number | null;
  source_text?: string | null;
  explanation?: string;
  phrases?: GeneratedPhrase[];
};

export type VocabularyItem = {
  id: string;
  text: string;
  segments: VocabSegment[];
  meaning: string;
  grammatical_category: string;
  extra: VocabularyExtra;
  status: "pending" | "enriched" | "failed";
  notes: string;
  category_id: string | null;
  created: string;
  modified: string;
};

export type VocabularyItemCreateResponse = {
  item: VocabularyItem;
  already_existed: boolean;
};

export type UserSettings = {
  native_language: string;
  extra: Record<string, unknown>;
};
