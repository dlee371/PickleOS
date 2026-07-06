import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(1, "Full name is required"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createLeagueSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  format: z.enum(["round_robin", "single_elim"]),
  requiresApproval: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const updateLeagueSchema = createLeagueSchema.partial().omit({ format: true });

export const joinLeagueSchema = z.object({
  joinCode: z.string().min(1),
});

export const updateMemberSchema = z.object({
  status: z.enum(["active", "removed"]).optional(),
  role: z.enum(["admin", "player"]).optional(),
});

export const createMatchSchema = z.object({
  player1Id: z.string().uuid(),
  player2Id: z.string().uuid(),
  scheduledAt: z.string().optional(),
  courtLabel: z.string().optional(),
});

export const updateMatchSchema = z.object({
  scheduledAt: z.string().optional(),
  courtLabel: z.string().optional(),
  status: z.enum(["scheduled", "cancelled"]).optional(),
});

export const submitScoreSchema = z.object({
  player1Score: z.number().int().min(0),
  player2Score: z.number().int().min(0),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(1).optional(),
  avatarUrl: z.string().url().optional(),
  phone: z.string().optional(),
});
