import bcrypt from "bcryptjs";
import { prisma } from "../db/client";
import { signToken } from "../utils/jwt";
import { ApiError } from "../middleware/error";

const SALT_ROUNDS = 10;

export async function signup(params: { email: string; password: string; fullName: string }) {
  const existing = await prisma.user.findUnique({ where: { email: params.email } });
  if (existing) {
    throw new ApiError(409, "email_taken", "An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(params.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: params.email,
      passwordHash,
      fullName: params.fullName,
    },
  });

  const token = signToken({ userId: user.id });
  return { user: sanitizeUser(user), token };
}

export async function login(params: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: params.email } });
  if (!user) {
    throw new ApiError(401, "invalid_credentials", "Invalid email or password");
  }

  const valid = await bcrypt.compare(params.password, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, "invalid_credentials", "Invalid email or password");
  }

  const token = signToken({ userId: user.id });
  return { user: sanitizeUser(user), token };
}

// Never return the password hash to the client.
export function sanitizeUser<T extends { passwordHash: string }>(user: T) {
  const { passwordHash: _drop, ...rest } = user;
  return rest;
}
