import { api } from "./client";
import type { Score } from "./types";

export async function submitScore(matchId: string, player1Score: number, player2Score: number) {
  const { data } = await api.post<{ score: Score }>(`/matches/${matchId}/scores`, {
    player1Score,
    player2Score,
  });
  return data.score;
}

export async function confirmScore(scoreId: string) {
  const { data } = await api.patch<{ score: Score }>(`/scores/${scoreId}/confirm`);
  return data.score;
}

export async function overrideScore(scoreId: string, player1Score: number, player2Score: number) {
  const { data } = await api.patch<{ score: Score }>(`/scores/${scoreId}/override`, {
    player1Score,
    player2Score,
  });
  return data.score;
}
