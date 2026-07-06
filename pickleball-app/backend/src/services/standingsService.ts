import { prisma } from "../db/client";

interface StandingRow {
  userId: string;
  fullName: string;
  played: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointsDiff: number;
}

/**
 * Standings are computed on read rather than stored, per the architecture
 * doc — simplest correct approach for MVP scale, avoids cache invalidation
 * bugs. Revisit with a materialized view only if this becomes a bottleneck.
 */
export async function getStandings(leagueId: string): Promise<StandingRow[]> {
  const members = await prisma.leagueMembership.findMany({
    where: { leagueId, status: "active", role: "player" },
    include: { user: { select: { id: true, fullName: true } } },
  });

  const completedMatches = await prisma.match.findMany({
    where: { leagueId, status: "completed" },
    include: { score: true },
  });

  const table = new Map<string, StandingRow>();
  for (const m of members) {
    table.set(m.userId, {
      userId: m.userId,
      fullName: m.user.fullName,
      played: 0,
      wins: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pointsDiff: 0,
    });
  }

  for (const match of completedMatches) {
    if (!match.score || !match.player1Id || !match.player2Id) continue;
    const p1 = table.get(match.player1Id);
    const p2 = table.get(match.player2Id);
    const { player1Score, player2Score } = match.score;

    if (p1) {
      p1.played += 1;
      p1.pointsFor += player1Score;
      p1.pointsAgainst += player2Score;
      if (player1Score > player2Score) p1.wins += 1;
      else p1.losses += 1;
    }
    if (p2) {
      p2.played += 1;
      p2.pointsFor += player2Score;
      p2.pointsAgainst += player1Score;
      if (player2Score > player1Score) p2.wins += 1;
      else p2.losses += 1;
    }
  }

  const rows = Array.from(table.values()).map((r) => ({ ...r, pointsDiff: r.pointsFor - r.pointsAgainst }));

  rows.sort((a, b) => b.wins - a.wins || b.pointsDiff - a.pointsDiff || b.pointsFor - a.pointsFor);

  return rows;
}
