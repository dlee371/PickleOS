import { PrismaClient } from "@prisma/client";

// Reuse a single PrismaClient instance across the app (avoids exhausting
// DB connections in dev with hot-reload, and is the standard pattern).
export const prisma = new PrismaClient();
