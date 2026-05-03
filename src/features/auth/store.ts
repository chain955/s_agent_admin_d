import { clearStoredAuth, readStoredAuth, writeStoredAuth, type StoredAuth } from "./storage";

// Module-level auth store. sessionStorage is the persistence layer; this
// module is the single in-memory source of truth that the API client
// middleware and the React tree both observe.
type Listener = (auth: StoredAuth | null) => void;

let current: StoredAuth | null = readStoredAuth();
const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) listener(current);
}

export const authStore = {
  get(): StoredAuth | null {
    return current;
  },
  set(auth: StoredAuth | null): void {
    current = auth;
    if (auth) writeStoredAuth(auth);
    else clearStoredAuth();
    emit();
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
