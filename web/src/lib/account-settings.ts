import type { components } from "@/lib/api/schema";
import { apiFetch, apiReadJson } from "@/lib/api-request";
import type { UserSettings } from "@/lib/vocabulary-types";

export type UserResponse = components["schemas"]["UserResponse"];
export type OrganizationResponse = components["schemas"]["OrganizationResponse"];

export async function fetchCurrentUser(token: string): Promise<UserResponse> {
  const response = await apiFetch("/auth/me", token);
  return apiReadJson<UserResponse>(response, "Failed to load profile");
}

export async function patchCurrentUser(
  token: string,
  body: components["schemas"]["UserUpdateRequest"],
): Promise<UserResponse> {
  const response = await apiFetch("/auth/me", token, {
    method: "PATCH",
    jsonBody: body,
  });
  return apiReadJson<UserResponse>(response, "Failed to update profile");
}

export async function patchActiveOrganization(
  token: string,
  body: components["schemas"]["OrganizationUpdateRequest"],
): Promise<OrganizationResponse> {
  const response = await apiFetch("/auth/organization", token, {
    method: "PATCH",
    jsonBody: body,
  });
  return apiReadJson<OrganizationResponse>(response, "Failed to update organization");
}

export async function fetchUserSettings(token: string): Promise<UserSettings> {
  const response = await apiFetch("/auth/settings", token);
  return apiReadJson<UserSettings>(response, "Failed to load user settings");
}

export async function putUserSettings(
  token: string,
  body: { native_language: string; extra?: Record<string, unknown> },
): Promise<UserSettings> {
  const response = await apiFetch("/auth/settings", token, {
    method: "PUT",
    jsonBody: body,
  });
  return apiReadJson<UserSettings>(response, "Failed to save user settings");
}

export type VoiceOption = components["schemas"]["VoiceOptionSchema"];
export type VoiceCatalog = components["schemas"]["VoiceCatalogResponse"];

export async function fetchVoices(token: string): Promise<VoiceCatalog> {
  const response = await apiFetch("/messages/voices", token);
  return apiReadJson<VoiceCatalog>(response, "Failed to load voices");
}

export type VoicePreviewRole = "narrator" | "japanese";

export type VoicePreviewResponse = {
  media_id: string;
  url: string;
};

export async function previewVoice(
  token: string,
  body: { voice: string; role: VoicePreviewRole },
): Promise<VoicePreviewResponse> {
  const response = await apiFetch("/messages/voices/preview", token, {
    method: "POST",
    jsonBody: body,
  });
  return apiReadJson<VoicePreviewResponse>(response, "Failed to preview voice");
}
