import { apiFetch, apiReadJson } from "@/lib/api-request";
import type {
  GeneratedPhrase,
  UserSettings,
  VocabularyCategory,
  VocabularyItem,
  VocabularyItemCreateResponse,
} from "@/lib/vocabulary-types";

export async function fetchVocabularyCategories(token: string): Promise<VocabularyCategory[]> {
  const response = await apiFetch("/vocabulary/categories", token);
  return apiReadJson(response, "Failed to load categories");
}

export async function createVocabularyCategory(
  token: string,
  body: { name: string; color?: string; ordering?: number },
): Promise<VocabularyCategory> {
  const response = await apiFetch("/vocabulary/categories", token, {
    method: "POST",
    jsonBody: body,
  });
  return apiReadJson(response, "Failed to create category");
}

export async function updateVocabularyCategory(
  token: string,
  id: string,
  body: { name?: string; color?: string; ordering?: number },
): Promise<VocabularyCategory> {
  const response = await apiFetch(`/vocabulary/categories/${id}`, token, {
    method: "PATCH",
    jsonBody: body,
  });
  return apiReadJson(response, "Failed to update category");
}

export async function deleteVocabularyCategory(token: string, id: string): Promise<void> {
  const response = await apiFetch(`/vocabulary/categories/${id}`, token, { method: "DELETE" });
  if (!response.ok) await apiReadJson(response, "Failed to delete category");
}

export async function fetchVocabularyItems(
  token: string,
  params?: { category?: string; status?: string; q?: string; uncategorized?: boolean },
): Promise<VocabularyItem[]> {
  const search = new URLSearchParams();
  if (params?.category) search.set("category", params.category);
  if (params?.status) search.set("status", params.status);
  if (params?.q) search.set("q", params.q);
  if (params?.uncategorized) search.set("uncategorized", "true");
  const qs = search.toString();
  const path = qs ? `/vocabulary/items?${qs}` : "/vocabulary/items";
  const response = await apiFetch(path, token);
  return apiReadJson(response, "Failed to load vocabulary items");
}

export async function fetchVocabularyItem(token: string, id: string): Promise<VocabularyItem> {
  const response = await apiFetch(`/vocabulary/items/${id}`, token);
  return apiReadJson(response, "Failed to load vocabulary item");
}

export async function createVocabularyItem(
  token: string,
  body: { text: string; category_id?: string | null; notes?: string },
): Promise<VocabularyItemCreateResponse> {
  const response = await apiFetch("/vocabulary/items", token, {
    method: "POST",
    jsonBody: body,
  });
  return apiReadJson(response, "Failed to add vocabulary item");
}

export async function updateVocabularyItem(
  token: string,
  id: string,
  body: {
    category_id?: string | null;
    clear_category?: boolean;
    notes?: string;
    re_enrich?: boolean;
  },
): Promise<VocabularyItem> {
  const response = await apiFetch(`/vocabulary/items/${id}`, token, {
    method: "PATCH",
    jsonBody: body,
  });
  return apiReadJson(response, "Failed to update vocabulary item");
}

export async function deleteVocabularyItem(token: string, id: string): Promise<void> {
  const response = await apiFetch(`/vocabulary/items/${id}`, token, { method: "DELETE" });
  if (!response.ok) await apiReadJson(response, "Failed to delete vocabulary item");
}

export async function generatePhrases(
  token: string,
  itemId: string,
): Promise<{ phrases: GeneratedPhrase[] }> {
  const response = await apiFetch(`/vocabulary/items/${itemId}/phrases/generate`, token, {
    method: "POST",
  });
  return apiReadJson(response, "Failed to generate phrases");
}

export async function savePhrases(
  token: string,
  itemId: string,
  phrases: GeneratedPhrase[],
): Promise<VocabularyItem> {
  const response = await apiFetch(`/vocabulary/items/${itemId}/phrases/save`, token, {
    method: "POST",
    jsonBody: { phrases },
  });
  return apiReadJson(response, "Failed to save phrases");
}

export type VocabOrganizeStartResponse = {
  status: string;
  uncategorized_count: number;
};

export type VocabOrganizeStatusResponse = {
  status: string;
  summary: string;
  remaining_uncategorized: number;
};

export async function startVocabOrganize(
  token: string,
  body: { allow_create_categories: boolean; hint?: string },
): Promise<VocabOrganizeStartResponse> {
  const response = await apiFetch("/vocabulary/organize", token, {
    method: "POST",
    jsonBody: body,
  });
  return apiReadJson(response, "Failed to start vocabulary organization");
}

export async function fetchVocabOrganizeStatus(token: string): Promise<VocabOrganizeStatusResponse> {
  const response = await apiFetch("/vocabulary/organize/status", token);
  return apiReadJson(response, "Failed to load organization status");
}

export async function dismissVocabOrganize(token: string): Promise<{ status: string }> {
  const response = await apiFetch("/vocabulary/organize/dismiss", token, { method: "POST" });
  return apiReadJson(response, "Failed to dismiss organization status");
}

export type VocabularyAudioResponse = {
  media_id: string;
  url: string;
  voice: string;
  text: string;
};

export async function synthesizeVocabularyAudio(
  token: string,
  text: string,
): Promise<VocabularyAudioResponse> {
  const response = await apiFetch("/vocabulary/audio", token, {
    method: "POST",
    jsonBody: { text },
  });
  return apiReadJson(response, "Failed to generate audio");
}

// ---------------------------------------------------------------------------
// Vocab Q&A
// ---------------------------------------------------------------------------

export type VocabQAMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created: string;
  japanese_renders?: { segments: { text: string; furigana?: string | null }[]; translation?: string }[];
  audio_segments?: import("@/lib/chat-task-types").AudioSegment[];
};

export type VocabQAHistoryResponse = {
  conversation_id: string | null;
  messages: VocabQAMessage[];
};

export type VocabQASendResponse = {
  status: string;
  conversation_id: string;
  message_id: string;
};

export type VocabQAClearResponse = {
  status: string;
  had_active_conversation: boolean;
};

export async function fetchVocabQAHistory(
  token: string,
  itemId: string,
): Promise<VocabQAHistoryResponse> {
  const response = await apiFetch(`/vocab-qa/${itemId}/history`, token);
  return apiReadJson(response, "Failed to load Q&A history");
}

export async function sendVocabQAMessage(
  token: string,
  itemId: string,
  message: string,
): Promise<VocabQASendResponse> {
  const response = await apiFetch(`/vocab-qa/${itemId}/send`, token, {
    method: "POST",
    jsonBody: { message },
  });
  return apiReadJson(response, "Failed to send message");
}

export async function clearVocabQAConversation(
  token: string,
  itemId: string,
): Promise<VocabQAClearResponse> {
  const response = await apiFetch(`/vocab-qa/${itemId}/clear`, token, {
    method: "POST",
  });
  return apiReadJson(response, "Failed to clear conversation");
}

export async function fetchUserSettings(token: string): Promise<UserSettings> {
  const response = await apiFetch("/auth/settings", token);
  return apiReadJson(response, "Failed to load settings");
}

export async function putUserSettings(
  token: string,
  body: { native_language: string; extra?: Record<string, unknown> },
): Promise<UserSettings> {
  const response = await apiFetch("/auth/settings", token, {
    method: "PUT",
    jsonBody: body,
  });
  return apiReadJson(response, "Failed to save settings");
}
