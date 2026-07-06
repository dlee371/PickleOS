import { Request, Response } from "express";
import { prisma } from "../db/client";
import { asyncHandler } from "../middleware/error";
import { sanitizeUser } from "../services/authService";
import { ApiError } from "../middleware/error";

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw new ApiError(404, "not_found", "User not found");
  res.json({ user: sanitizeUser(user) });
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, avatarUrl, phone } = req.body;
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { fullName, avatarUrl, phone },
  });
  res.json({ user: sanitizeUser(user) });
});
