// sessionStorage I/O for the admin Basic Auth credentials.
// Key and shape are locked in FRONTEND_CLAUDE.md §4.5.

export const STORAGE_KEY = "ha-admin-auth";

export type StoredAuth = {
  login: string;
  basic: string;
};

function getSessionStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readStoredAuth(): StoredAuth | null {
  const ss = getSessionStorage();
  if (!ss) return null;
  const raw = ss.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof (parsed as StoredAuth).login === "string" &&
      typeof (parsed as StoredAuth).basic === "string"
    ) {
      return { login: (parsed as StoredAuth).login, basic: (parsed as StoredAuth).basic };
    }
  } catch {
    // fallthrough — stale value, treat as unauthenticated
  }
  ss.removeItem(STORAGE_KEY);
  return null;
}

export function writeStoredAuth(auth: StoredAuth): void {
  const ss = getSessionStorage();
  if (!ss) return;
  ss.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearStoredAuth(): void {
  const ss = getSessionStorage();
  if (!ss) return;
  ss.removeItem(STORAGE_KEY);
}
