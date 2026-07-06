import { Request, Response } from "express";
import * as scheduleService from "../services/scheduleService";
import { asyncHandler } from "../middleware/error";

export const listMatches = asyncHandler(async (req: Request, res: Response) => {
  const matches = await scheduleService.getMatchesForLeague(req.params.id);
  res.json({ matches });
});

export const createMatch = asyncHandler(async (req: Request, res: Response) => {
  const match = await scheduleService.createManualMatch({ leagueId: req.params.id, ...req.body });
  res.status(201).json({ match });
});

export const generateSchedule = asyncHandler(async (req: Request, res: Response) => {
  const matches = await scheduleService.generateRoundRobinSchedule(req.params.id);
  res.status(201).json({ matches });
});

export const updateMatch = asyncHandler(async (req: Request, res: Response) => {
  const match = await scheduleService.updateMatch(req.params.matchId, req.body);
  res.json({ match });
});
