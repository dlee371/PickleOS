import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes";
import leagueRoutes from "./routes/leagueRoutes";
import matchRoutes from "./routes/matchRoutes";
import scoreRoutes from "./routes/scoreRoutes";
import userRoutes from "./routes/userRoutes";
import { errorHandler, notFoundHandler } from "./middleware/error";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/leagues", leagueRoutes);
app.use("/api/v1/matches", matchRoutes);
app.use("/api/v1", scoreRoutes); // mounts /matches/:matchId/scores and /scores/:scoreId/*
app.use("/api/v1/users", userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Pickleball League backend running on port ${PORT}`);
});
