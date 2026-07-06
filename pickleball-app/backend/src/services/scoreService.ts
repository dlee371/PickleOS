import { prisma } from "../db/client";
import { ApiError } from "../middleware/error";

export async function submitScore(params: {
  matchId: string;
  submittedBy: string;
  player1Score: number;
  player2Score: number;
}) {
  const match = await prisma.match.findUnique({ where: { id: params.matchId }, include: { score: true } });
  if (!match) throw new ApiError(404, "not_found", "Match not found");
  if (match.score) throw new ApiError(409, "score_exists", "A score has already been submitted for this match");
  if (params.submittedBy !== match.player1Id && params.submittedBy !== match.player2Id) {
    throw new ApiError(403, "forbidden", "Only match participants can submit a score");
  }

  const score = await prisma.score.create({
    data: {
      matchId: params.matchId,
      player1Score: params.player1Score,
      player2Score: params.player2Score,
      submittedBy: params.submittedBy,
    },
  });

  await prisma.match.update({ where: { id: params.matchId }, data: { status: "awaiting_confirmation" } });
  return score;
}

export async function confirmScore(scoreId: string, confirmingUserId: string) {
  const score = await prisma.score.findUnique({ where: { id: scoreId }, include: { match: true } });
  if (!score) throw new ApiError(404, "not_found", "Score not found");
  if (score.submittedBy === confirmingUserId) {
    throw new ApiError(400, "cannot_self_confirm", "The submitting player cannot confirm their own score");
  }
  const isParticipant = confirmingUserId === score.match.player1Id || confirmingUserId === score.match.player2Id;
  if (!isParticipant) {
    throw new ApiError(403, "forbidden", "Only the opposing player can confirm this score");
  }

  const updated = await prisma.score.update({
    where: { id: scoreId },
    data: { confirmedBy: confirmingUserId, confirmedAt: new Date() },
  });
  await prisma.match.update({ where: { id: score.matchId }, data: { status: "completed" } });
  return updated;
}

export async function overrideScore(
  scoreIdOrMatchId: { scoreId?: string; matchId?: string },
  adminUserId: string,
  values: { player1Score: number; player2Score: number }
) {
  let score = scoreIdOrMatchId.scoreId
    ? await prisma.score.findUnique({ where: { id: scoreIdOrMatchId.scoreId } })
    : await prisma.score.findUnique({ where: { matchId: scoreIdOrMatchId.matchId } });

  if (score) {
    score = await prisma.score.update({
      where: { id: score.id },
      data: {
        player1Score: values.player1Score,
        player2Score: values.player2Score,
        adminOverride: true,
        confirmedBy: adminUserId,
        confirmedAt: new Date(),
      },
    });
  } else if (scoreIdOrMatchId.matchId) {
    score = await prisma.score.create({
      data: {
        matchId: scoreIdOrMatchId.matchId,
        player1Score: values.player1Score,
        player2Score: values.player2Score,
        submittedBy: adminUserId,
        confirmedBy: adminUserId,
        confirmedAt: new Date(),
        adminOverride: true,
      },
    });
  } else {
    throw new ApiError(404, "not_found", "Score or match not found");
  }

  await prisma.match.update({ where: { id: score.matchId }, data: { status: "completed" } });
  return score;
}
