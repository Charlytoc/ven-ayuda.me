import { API_BASE_URL } from "@/lib/api-base";
import type {
  PushSubscriptionPayload,
  RescuerProfile,
  RescuerProfileUpdate,
} from "@/lib/types/rescuer";

type ApiError = { error: string };

async function authedFetch<T>(
  token: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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
      // ignore
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function updateRescuerProfile(
  token: string,
  payload: RescuerProfileUpdate,
): Promise<RescuerProfile> {
  return authedFetch<RescuerProfile>(token, "/rescuer/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function fetchVapidPublicKey(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/rescuer/vapid-public-key`);
  if (!response.ok) {
    throw new Error("Web Push no está configurado en el servidor");
  }
  const body = (await response.json()) as { public_key: string };
  return body.public_key;
}

export async function savePushSubscription(
  token: string,
  payload: PushSubscriptionPayload,
): Promise<void> {
  await authedFetch<void>(token, "/rescuer/push-subscriptions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deletePushSubscription(
  token: string,
  endpoint: string,
): Promise<void> {
  await authedFetch<void>(token, "/rescuer/push-subscriptions", {
    method: "DELETE",
    body: JSON.stringify({ endpoint }),
  });
}
