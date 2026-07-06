import { Request, Response } from "express";
import * as bracketService from "../services/bracketService";
import { asyncHandler } from "../middleware/error";

export const generateBracket = asyncHandler(async (req: Request, res: Response) => {
  const bracket = await bracketService.generateBracket(req.params.id);
  res.status(201).json({ bracket });
});

export const getBracket = asyncHandler(async (req: Request, res: Response) => {
  const bracket = await bracketService.getBracket(req.params.id);
  res.json({ bracket });
});
