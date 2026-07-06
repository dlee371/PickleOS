export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  phone?: string | null;
}

export type LeagueFormat = "round_robin" | "single_elim";

export interface League {
  id: string;
  name: string;
  description?: string | null;
  format: LeagueFormat;
  joinCode: string;
  requiresApproval: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdBy: string;
  createdAt: string;
}

export type MembershipRole = "admin" | "player";
export type MembershipStatus = "pending" | "active" | "removed";

export interface Member {
  id: string;
  leagueId: string;
  userId: string;
  role: MembershipRole;
  status: MembershipStatus;
  joinedAt: string;
  user: { id: string; fullName: string; email: string; avatarUrl?: string | null };
}

export type MatchStatus = "scheduled" | "awaiting_confirmation" | "completed" | "cancelled";

export interface Score {
  id: string;
  matchId: string;
  player1Score: number;
  player2Score: number;
  submittedBy: string;
  confirmedBy?: string | null;
  adminOverride: boolean;
}

export interface Match {
  id: string;
  leagueId: string;
  round?: number | null;
  player1Id?: string | null;
  player2Id?: string | null;
  player1?: { id: string; fullName: string; avatarUrl?: string | null } | null;
  player2?: { id: string; fullName: string; avatarUrl?: string | null } | null;
  scheduledAt?: string | null;
  courtLabel?: string | null;
  status: MatchStatus;
  score?: Score | null;
}

export interface StandingRow {
  userId: string;
  fullName: string;
  played: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointsDiff: number;
}

export interface BracketSlot {
  id: string;
  leagueId: string;
  round: number;
  position: number;
  match: Match | null;
}
