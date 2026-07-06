import { prisma } from "../db/client";
import { ApiError } from "../middleware/error";

export async function createManualMatch(params: {
  leagueId: string;
  player1Id: string;
  player2Id: string;
  scheduledAt?: string;
  courtLabel?: string;
}) {
  return prisma.match.create({
    data: {
      leagueId: params.leagueId,
      player1Id: params.player1Id,
      player2Id: params.player2Id,
      scheduledAt: params.scheduledAt ? new Date(params.scheduledAt) : undefined,
      courtLabel: params.courtLabel,
      status: "scheduled",
    },
  });
}

export async function getMatchesForLeague(leagueId: string) {
  return prisma.match.findMany({
    where: { leagueId },
    include: {
      player1: { select: { id: true, fullName: true, avatarUrl: true } },
      player2: { select: { id: true, fullName: true, avatarUrl: true } },
      score: true,
    },
    orderBy: [{ round: "asc" }, { scheduledAt: "asc" }],
  });
}

export async function updateMatch(
  matchId: string,
  updates: Partial<{ scheduledAt: string; courtLabel: string; status: "scheduled" | "cancelled" }>
) {
  return prisma.match.update({
    where: { id: matchId },
    data: {
      ...updates,
      scheduledAt: updates.scheduledAt ? new Date(updates.scheduledAt) : undefined,
    },
  });
}

/**
 * Generates a standard round-robin schedule using the classic "circle method":
 * fix one player, rotate the rest around them each round so every player
 * faces every other player exactly once. If there's an odd number of
 * players, a "bye" (null player2 slot for that round) is inserted.
 */
export async function generateRoundRobinSchedule(leagueId: string) {
  const activeMembers = await prisma.leagueMembership.findMany({
    where: { leagueId, status: "active", role: "player" },
    select: { userId: true },
  });

  const playerIds = activeMembers.map((m: { userId: string }) => m.userId);
  if (playerIds.length < 2) {
    throw new ApiError(400, "not_enough_players", "Need at least 2 active players to generate a schedule");
  }

  // Delete any previously auto-generated, not-yet-played schedule to avoid duplicates
  await prisma.match.deleteMany({
    where: { leagueId, status: "scheduled", score: null },
  });

  const players = [...playerIds];
  const hasBye = players.length % 2 !== 0;
  if (hasBye) players.push(null as unknown as string); // bye slot

  const n = players.length;
  const rounds = n - 1;
  const half = n / 2;
  const rotation = [...players];
  const createdMatches = [];

  for (let round = 0; round < rounds; round++) {
    for (let i = 0; i < half; i++) {
      const p1 = rotation[i];
      const p2 = rotation[n - 1 - i];
      if (p1 && p2) {
        createdMatches.push({ leagueId, round: round + 1, player1Id: p1, player2Id: p2, status: "scheduled" as const });
      }
    }
    // Rotate all but the first player
    const fixed = rotation[0];
    const rest = rotation.slice(1);
    rest.unshift(rest.pop() as string);
    rotation.splice(0, rotation.length, fixed, ...rest);
  }

  await prisma.match.createMany({ data: createdMatches });
  return getMatchesForLeague(leagueId);
}
