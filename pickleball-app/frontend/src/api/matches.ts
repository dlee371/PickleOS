import { api } from "./client";
import type { Match } from "./types";

export async function listMatches(leagueId: string) {
  const { data } = await api.get<{ matches: Match[] }>(`/leagues/${leagueId}/matches`);
  return data.matches;
}

export async function createMatch(
  leagueId: string,
  params: { player1Id: string; player2Id: string; scheduledAt?: string; courtLabel?: string }
) {
  const { data } = await api.post<{ match: Match }>(`/leagues/${leagueId}/matches`, params);
  return data.match;
}

export async function generateSchedule(leagueId: string) {
  const { data } = await api.post<{ matches: Match[] }>(`/leagues/${leagueId}/generate-schedule`);
  return data.matches;
}

export async function updateMatch(
  matchId: string,
  updates: Partial<{ scheduledAt: string; courtLabel: string; status: "scheduled" | "cancelled" }>
) {
  const { data } = await api.patch<{ match: Match }>(`/matches/${matchId}`, updates);
  return data.match;
}
