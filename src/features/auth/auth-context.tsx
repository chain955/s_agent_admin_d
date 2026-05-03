import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authStore } from "./store";
import type { StoredAuth } from "./storage";

type AuthContextValue = {
  login: string | null;
  basic: string | null;
  signIn: (auth: StoredAuth) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type Props = { children: React.ReactNode };

export function AuthProvider({ children }: Props) {
  const [state, setState] = useState<StoredAuth | null>(() => authStore.get());

  useEffect(() => authStore.subscribe(setState), []);

  const signIn = useCallback((auth: StoredAuth) => {
    authStore.set(auth);
  }, []);

  const logout = useCallback(() => {
    authStore.set(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        login: state?.login ?? null,
        basic: state?.basic ?? null,
        signIn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
