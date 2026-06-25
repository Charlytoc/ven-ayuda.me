const TOKEN_KEY = "ven-emergencias.rescuer.token";
const USER_KEY = "ven-emergencias.rescuer.user";

export type RescuerSessionUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
};

export function getRescuerToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
}

export function getRescuerUser(): RescuerSessionUser | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as RescuerSessionUser;
  } catch {
    return null;
  }
}

export function setRescuerSession(token: string, user: RescuerSessionUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearRescuerSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isRescuerLoggedIn(): boolean {
  return Boolean(getRescuerToken());
}
