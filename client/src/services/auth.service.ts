import { apiRequest } from "./api";
import type { ApiResponse, User } from "../types/auth.types";

interface AuthResult extends ApiResponse {
  user?: User;
  data?: { user?: User };
}

function extractUser(result: AuthResult): User {
  const user = result.user ?? result.data?.user;

  if (!user) {
    throw new Error("The server did not return a user profile.");
  }

  return user;
}

export async function getCurrentUser(): Promise<User> {
  const result = await apiRequest<AuthResult>("/api/auth/me");
  return extractUser(result);
}

export async function login(
  email: string,
  password: string,
): Promise<User> {
  const result = await apiRequest<AuthResult>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return extractUser(result);
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<User> {
  const result = await apiRequest<AuthResult>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

  return extractUser(result);
}

export async function logout(): Promise<void> {
  await apiRequest("/api/auth/logout", {
    method: "POST",
  });
}