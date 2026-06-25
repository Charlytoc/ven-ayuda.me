import { API_BASE_URL } from "@/lib/api-base";

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${p}`;
}

export function apiAuthHeaders(
  token: string,
  options: { json?: boolean } = {},
): HeadersInit {
  const h: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (options.json) {
    h["Content-Type"] = "application/json";
  }
  return h;
}

export async function throwApiError(response: Response, fallback: string): Promise<never> {
  let message = fallback;
  try {
    const body = (await response.json()) as { error?: string };
    if (body?.error) message = body.error;
  } catch {
    // ignore
  }
  throw new Error(`${message} (${response.status})`);
}

export type ApiFetchInit = Omit<RequestInit, "body"> & {
  jsonBody?: unknown;
  // Raw body (e.g. FormData for file uploads). Mutually exclusive with jsonBody.
  body?: BodyInit | null;
};

export async function apiFetch(
  path: string,
  token: string,
  init: ApiFetchInit = {},
): Promise<Response> {
  const { jsonBody, body, headers: extraHeaders, ...rest } = init;
  const headers = new Headers(apiAuthHeaders(token, { json: jsonBody !== undefined }));
  if (extraHeaders) {
    new Headers(extraHeaders).forEach((value, key) => {
      headers.set(key, value);
    });
  }
  const resolvedBody =
    jsonBody !== undefined ? JSON.stringify(jsonBody) : body !== undefined ? body : undefined;
  return fetch(apiUrl(path), {
    ...rest,
    headers,
    body: resolvedBody,
  });
}

export async function apiReadJson<T>(response: Response, fallback: string): Promise<T> {
  if (!response.ok) await throwApiError(response, fallback);
  return response.json() as Promise<T>;
}

export async function apiJson<T>(
  path: string,
  token: string,
  fallback: string,
  init: ApiFetchInit = {},
): Promise<T> {
  const response = await apiFetch(path, token, init);
  return apiReadJson<T>(response, fallback);
}
