import { Request, Response } from "express";
import * as authService from "../services/authService";
import { prisma } from "../db/client";
import { asyncHandler } from "../middleware/error";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { user, token } = await authService.signup(req.body);
  res.cookie("token", token, COOKIE_OPTIONS);
  res.status(201).json({ user, token });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, token } = await authService.login(req.body);
  res.cookie("token", token, COOKIE_OPTIONS);
  res.json({ user, token });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(204).send();
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  res.json({ user: user ? authService.sanitizeUser(user) : null });
});
