import { API_BASE_URL } from "@/lib/api-base";
import {
  setRescuerSession,
  type RescuerSessionUser,
} from "@/lib/rescuer-auth-storage";
import type {
  AuthMeResponse,
  AuthTokenResponse,
} from "@/lib/types/rescuer";

type ApiError = { error: string };

async function parseError(response: Response, fallback: string): Promise<never> {
  let message = fallback;
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

export async function registerRescuer(payload: {
  email: string;
  password: string;
  first_name: string;
  phone?: string;
}): Promise<AuthMeResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await parseError(response, "No se pudo completar el registro");
  }

  const tokenBody = (await response.json()) as AuthTokenResponse;
  const me = await fetchAuthMe(tokenBody.access_token);
  persistSession(tokenBody.access_token, me);
  return me;
}

export async function loginRescuer(payload: {
  email: string;
  password: string;
}): Promise<AuthMeResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await parseError(response, "Credenciales inválidas");
  }

  const tokenBody = (await response.json()) as AuthTokenResponse;
  const me = await fetchAuthMe(tokenBody.access_token);
  persistSession(tokenBody.access_token, me);
  return me;
}

export async function fetchAuthMe(token: string): Promise<AuthMeResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    await parseError(response, "Sesión inválida");
  }

  return (await response.json()) as AuthMeResponse;
}

function persistSession(token: string, me: AuthMeResponse): void {
  const user: RescuerSessionUser = {
    id: me.id,
    email: me.email,
    first_name: me.first_name,
    last_name: me.last_name,
  };
  setRescuerSession(token, user);
}

export async function refreshRescuerSession(
  token: string,
): Promise<AuthMeResponse> {
  const me = await fetchAuthMe(token);
  persistSession(token, me);
  return me;
}
