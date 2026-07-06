import { Request, Response } from "express";
import * as scoreService from "../services/scoreService";
import { asyncHandler } from "../middleware/error";

export const submitScore = asyncHandler(async (req: Request, res: Response) => {
  const score = await scoreService.submitScore({
    matchId: req.params.matchId,
    submittedBy: req.userId!,
    player1Score: req.body.player1Score,
    player2Score: req.body.player2Score,
  });
  res.status(201).json({ score });
});

export const confirmScore = asyncHandler(async (req: Request, res: Response) => {
  const score = await scoreService.confirmScore(req.params.scoreId, req.userId!);
  res.json({ score });
});

export const overrideScore = asyncHandler(async (req: Request, res: Response) => {
  const score = await scoreService.overrideScore({ scoreId: req.params.scoreId }, req.userId!, req.body);
  res.json({ score });
});
