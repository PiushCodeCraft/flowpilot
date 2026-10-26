
import { createContext } from "react";
import type { User } from "../types/auth.types";

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string;
  clearError: () => void;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<User>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
