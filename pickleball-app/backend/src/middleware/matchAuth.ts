import { NextFunction, Request, Response } from "express";
import { prisma } from "../db/client";
import { ApiError } from "./error";

// Looks up the match's league via matchId param and confirms the current
// user is an active admin of that league. Used for routes like
// PATCH /matches/:matchId and PATCH /scores/:scoreId/override, which are
// scoped by match/score id rather than league id directly.
export async function requireMatchLeagueAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    const matchId = req.params.matchId;
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new ApiError(404, "not_found", "Match not found");

    const membership = await prisma.leagueMembership.findFirst({
      where: { leagueId: match.leagueId, userId: req.userId, role: "admin", status: "active" },
    });
    if (!membership) throw new ApiError(403, "forbidden", "League admin access required");

    next();
  } catch (err) {
    next(err);
  }
}

export async function requireScoreLeagueAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    const scoreId = req.params.scoreId;
    const score = await prisma.score.findUnique({ where: { id: scoreId }, include: { match: true } });
    if (!score) throw new ApiError(404, "not_found", "Score not found");

    const membership = await prisma.leagueMembership.findFirst({
      where: { leagueId: score.match.leagueId, userId: req.userId, role: "admin", status: "active" },
    });
    if (!membership) throw new ApiError(403, "forbidden", "League admin access required");

    next();
  } catch (err) {
    next(err);
  }
}
