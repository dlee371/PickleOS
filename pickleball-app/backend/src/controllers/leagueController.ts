import { Request, Response } from "express";
import * as leagueService from "../services/leagueService";
import { asyncHandler } from "../middleware/error";

export const createLeague = asyncHandler(async (req: Request, res: Response) => {
  const league = await leagueService.createLeague({ ...req.body, createdBy: req.userId! });
  res.status(201).json({ league });
});

export const listMyLeagues = asyncHandler(async (req: Request, res: Response) => {
  const leagues = await leagueService.getLeaguesForUser(req.userId!);
  res.json({ leagues });
});

export const getLeague = asyncHandler(async (req: Request, res: Response) => {
  const league = await leagueService.getLeagueById(req.params.id);
  res.json({ league });
});

export const updateLeague = asyncHandler(async (req: Request, res: Response) => {
  const league = await leagueService.updateLeague(req.params.id, req.body);
  res.json({ league });
});

export const joinLeague = asyncHandler(async (req: Request, res: Response) => {
  const result = await leagueService.joinLeagueByCode(req.body.joinCode, req.userId!);
  res.status(201).json(result);
});

export const listMembers = asyncHandler(async (req: Request, res: Response) => {
  const members = await leagueService.getMembers(req.params.id);
  res.json({ members });
});

export const updateMember = asyncHandler(async (req: Request, res: Response) => {
  const membership = await leagueService.updateMemberStatus(req.params.id, req.params.userId, req.body);
  res.json({ membership });
});
