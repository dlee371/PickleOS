import { nanoid } from "nanoid";
import { prisma } from "../db/client";
import { ApiError } from "../middleware/error";

export async function createLeague(params: {
  name: string;
  description?: string;
  format: "round_robin" | "single_elim";
  requiresApproval?: boolean;
  startDate?: string;
  endDate?: string;
  createdBy: string;
}) {
  const joinCode = nanoid(8);

  const league = await prisma.league.create({
    data: {
      name: params.name,
      description: params.description,
      format: params.format,
      requiresApproval: params.requiresApproval ?? false,
      startDate: params.startDate ? new Date(params.startDate) : undefined,
      endDate: params.endDate ? new Date(params.endDate) : undefined,
      createdBy: params.createdBy,
      joinCode,
      memberships: {
        create: {
          userId: params.createdBy,
          role: "admin",
          status: "active",
        },
      },
    },
  });

  return league;
}

export async function getLeaguesForUser(userId: string) {
  return prisma.league.findMany({
    where: { memberships: { some: { userId, status: "active" } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getLeagueById(leagueId: string) {
  const league = await prisma.league.findUnique({ where: { id: leagueId } });
  if (!league) throw new ApiError(404, "not_found", "League not found");
  return league;
}

export async function updateLeague(
  leagueId: string,
  updates: Partial<{
    name: string;
    description: string;
    requiresApproval: boolean;
    startDate: string;
    endDate: string;
  }>
) {
  return prisma.league.update({
    where: { id: leagueId },
    data: {
      ...updates,
      startDate: updates.startDate ? new Date(updates.startDate) : undefined,
      endDate: updates.endDate ? new Date(updates.endDate) : undefined,
    },
  });
}

export async function joinLeagueByCode(joinCode: string, userId: string) {
  const league = await prisma.league.findUnique({ where: { joinCode } });
  if (!league) throw new ApiError(404, "invalid_code", "No league found for this join code");

  const existing = await prisma.leagueMembership.findUnique({
    where: { leagueId_userId: { leagueId: league.id, userId } },
  });
  if (existing) {
    throw new ApiError(409, "already_member", "You are already a member of this league");
  }

  const membership = await prisma.leagueMembership.create({
    data: {
      leagueId: league.id,
      userId,
      role: "player",
      status: league.requiresApproval ? "pending" : "active",
    },
  });

  return { league, membership };
}

export async function getMembers(leagueId: string) {
  return prisma.leagueMembership.findMany({
    where: { leagueId },
    include: { user: { select: { id: true, fullName: true, email: true, avatarUrl: true } } },
    orderBy: { joinedAt: "asc" },
  });
}

export async function updateMemberStatus(
  leagueId: string,
  userId: string,
  updates: { status?: "active" | "removed"; role?: "admin" | "player" }
) {
  const membership = await prisma.leagueMembership.findUnique({
    where: { leagueId_userId: { leagueId, userId } },
  });
  if (!membership) throw new ApiError(404, "not_found", "Membership not found");

  return prisma.leagueMembership.update({
    where: { leagueId_userId: { leagueId, userId } },
    data: updates,
  });
}
