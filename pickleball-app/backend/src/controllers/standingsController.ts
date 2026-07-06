import { Request, Response } from "express";
import { getStandings } from "../services/standingsService";
import { asyncHandler } from "../middleware/error";

export const standings = asyncHandler(async (req: Request, res: Response) => {
  const rows = await getStandings(req.params.id);
  res.json({ standings: rows });
});
