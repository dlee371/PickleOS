import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { ApiError } from "./error";
import { prisma } from "../db/client";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.token || extractBearerToken(req);
    if (!token) {
      throw new ApiError(401, "unauthorized", "Authentication required");
    }

    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      throw new ApiError(401, "unauthorized", "Invalid session");
    }

    req.userId = user.id;
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(new ApiError(401, "unauthorized", "Invalid or expired session"));
  }
}

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}

// Ensures the current user is an active admin of the :leagueId in the route params.
export async function requireLeagueAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    const leagueId = req.params.leagueId || req.params.id;
    const membership = await prisma.leagueMembership.findFirst({
      where: { leagueId, userId: req.userId, role: "admin", status: "active" },
    });
    if (!membership) {
      throw new ApiError(403, "forbidden", "League admin access required");
    }
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(err);
  }
}

// Ensures the current user is an active member (any role) of :leagueId.
export async function requireLeagueMember(req: Request, _res: Response, next: NextFunction) {
  try {
    const leagueId = req.params.leagueId || req.params.id;
    const membership = await prisma.leagueMembership.findFirst({
      where: { leagueId, userId: req.userId, status: "active" },
    });
    if (!membership) {
      throw new ApiError(403, "forbidden", "You are not a member of this league");
    }
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(err);
  }
}
