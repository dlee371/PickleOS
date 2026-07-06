import { prisma } from "../db/client";
import { ApiError } from "../middleware/error";
import { getStandings } from "./standingsService";

/**
 * Seeds a single-elimination bracket. Seeding is derived from current
 * standings (best record first) so a league can go straight from
 * round-robin play into playoffs. Byes are given to top seeds when the
 * player count isn't a power of two.
 */
export async function generateBracket(leagueId: string) {
  const standings = await getStandings(leagueId);
  if (standings.length < 2) {
    throw new ApiError(400, "not_enough_players", "Need at least 2 players to generate a bracket");
  }

  // Clear any existing bracket for this league before regenerating
  await prisma.bracketSlot.deleteMany({ where: { leagueId } });

  const seededPlayerIds = standings.map((s) => s.userId);
  const bracketSize = nextPowerOfTwo(seededPlayerIds.length);
  const slots: (string | null)[] = standardSeedOrder(bracketSize).map(
    (seedIndex) => seededPlayerIds[seedIndex] ?? null
  );

  const round1Matches: { player1Id: string | null; player2Id: string | null; position: number }[] = [];
  for (let i = 0; i < slots.length; i += 2) {
    round1Matches.push({ player1Id: slots[i], player2Id: slots[i + 1], position: i / 2 });
  }

  for (const rm of round1Matches) {
    // A bye (missing opponent) auto-completes in favor of the present player
    const isBye = !rm.player1Id || !rm.player2Id;
    const match = await prisma.match.create({
      data: {
        leagueId,
        round: 1,
        player1Id: rm.player1Id ?? undefined,
        player2Id: rm.player2Id ?? undefined,
        status: isBye ? "completed" : "scheduled",
      },
    });
    await prisma.bracketSlot.create({
      data: { leagueId, matchId: match.id, round: 1, position: rm.position },
    });
  }

  const totalRounds = Math.log2(bracketSize);
  for (let round = 2; round <= totalRounds; round++) {
    const matchesInRound = bracketSize / 2 ** round;
    for (let position = 0; position < matchesInRound; position++) {
      await prisma.bracketSlot.create({
        data: { leagueId, round, position }, // matchId filled in as earlier rounds complete
      });
    }
  }

  return getBracket(leagueId);
}

export async function getBracket(leagueId: string) {
  return prisma.bracketSlot.findMany({
    where: { leagueId },
    include: {
      match: {
        include: {
          player1: { select: { id: true, fullName: true } },
          player2: { select: { id: true, fullName: true } },
          score: true,
        },
      },
    },
    orderBy: [{ round: "asc" }, { position: "asc" }],
  });
}

function nextPowerOfTwo(n: number): number {
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

// Standard tournament seeding order (e.g., for 8 slots: 1v8, 4v5, 3v6, 2v7)
// so the top two seeds can only meet in the final.
function standardSeedOrder(size: number): number[] {
  if (size === 1) return [0];
  const prev = standardSeedOrder(size / 2);
  const result: number[] = [];
  for (const seed of prev) {
    result.push(seed, size - 1 - seed);
  }
  return result;
}
