import { API_BASE_URL } from "@/lib/api-base";
import type {
  ApiError,
  HelpRequest,
  HelpRequestCreate,
} from "@/lib/types/help-request";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as ApiError;
      if (body.error) {
        message = body.error;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function listHelpRequests(
  status?: string,
): Promise<HelpRequest[]> {
  const path = status
    ? `/help-requests/?status=${encodeURIComponent(status)}`
    : "/help-requests/";
  return apiFetch<HelpRequest[]>(path);
}

export async function createHelpRequest(
  payload: HelpRequestCreate,
): Promise<HelpRequest> {
  return apiFetch<HelpRequest>("/help-requests/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getHelpRequest(id: string): Promise<HelpRequest> {
  return apiFetch<HelpRequest>(`/help-requests/${id}/`);
}
