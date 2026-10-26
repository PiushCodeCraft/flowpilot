
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { User } from "../types/auth.types";
import * as authService from "../services/auth.service";
import { AuthContext } from "./auth-context";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshUser = useCallback(async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    let active = true;

    authService
      .getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setError("");

    try {
      const authenticatedUser = await authService.login(email, password);
      setUser(authenticatedUser);
      return authenticatedUser;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to sign in.";
      setError(message);
      throw err;
    }
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      setError("");

      try {
        const authenticatedUser = await authService.register(
          name,
          email,
          password,
        );

        setUser(authenticatedUser);
        return authenticatedUser;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to register.";
        setError(message);
        throw err;
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    setError("");

    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      clearError: () => setError(""),
      signIn,
      signUp,
      signOut,
      refreshUser,
    }),
    [user, loading, error, signIn, signUp, signOut, refreshUser],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
export { AuthContext };

