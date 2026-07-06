import { api } from "./client";
import type { League, LeagueFormat, Member } from "./types";

export async function createLeague(params: {
  name: string;
  description?: string;
  format: LeagueFormat;
  requiresApproval?: boolean;
  startDate?: string;
  endDate?: string;
}) {
  const { data } = await api.post<{ league: League }>("/leagues", params);
  return data.league;
}

export async function listMyLeagues() {
  const { data } = await api.get<{ leagues: League[] }>("/leagues");
  return data.leagues;
}

export async function getLeague(id: string) {
  const { data } = await api.get<{ league: League }>(`/leagues/${id}`);
  return data.league;
}

export async function updateLeague(id: string, updates: Partial<League>) {
  const { data } = await api.patch<{ league: League }>(`/leagues/${id}`, updates);
  return data.league;
}

export async function joinLeague(joinCode: string) {
  const { data } = await api.post<{ league: League }>("/leagues/join", { joinCode });
  return data.league;
}

export async function listMembers(leagueId: string) {
  const { data } = await api.get<{ members: Member[] }>(`/leagues/${leagueId}/members`);
  return data.members;
}

export async function updateMember(
  leagueId: string,
  userId: string,
  updates: { status?: "active" | "removed"; role?: "admin" | "player" }
) {
  const { data } = await api.patch<{ membership: Member }>(`/leagues/${leagueId}/members/${userId}`, updates);
  return data.membership;
}
