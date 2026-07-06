import { api } from "./client";
import type { User } from "./types";

export async function signup(params: { email: string; password: string; fullName: string }) {
  const { data } = await api.post<{ user: User }>("/auth/signup", params);
  return data.user;
}

export async function login(params: { email: string; password: string }) {
  const { data } = await api.post<{ user: User }>("/auth/login", params);
  return data.user;
}

export async function logout() {
  await api.post("/auth/logout");
}

export async function me() {
  const { data } = await api.get<{ user: User | null }>("/auth/me");
  return data.user;
}
