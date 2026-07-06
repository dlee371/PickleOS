import { api } from "./client";
import type { StandingRow, BracketSlot } from "./types";

export async function getStandings(leagueId: string) {
  const { data } = await api.get<{ standings: StandingRow[] }>(`/leagues/${leagueId}/standings`);
  return data.standings;
}

export async function generateBracket(leagueId: string) {
  const { data } = await api.post<{ bracket: BracketSlot[] }>(`/leagues/${leagueId}/bracket/generate`);
  return data.bracket;
}

export async function getBracket(leagueId: string) {
  const { data } = await api.get<{ bracket: BracketSlot[] }>(`/leagues/${leagueId}/bracket`);
  return data.bracket;
}
