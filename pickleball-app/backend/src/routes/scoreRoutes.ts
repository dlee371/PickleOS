import { Router } from "express";
import * as scoreController from "../controllers/scoreController";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { submitScoreSchema } from "../utils/schemas";
import { requireScoreLeagueAdmin } from "../middleware/matchAuth";

const router = Router();

router.use(requireAuth);

// POST /matches/:matchId/scores
router.post("/matches/:matchId/scores", validateBody(submitScoreSchema), scoreController.submitScore);

// PATCH /scores/:scoreId/confirm
router.patch("/scores/:scoreId/confirm", scoreController.confirmScore);

// PATCH /scores/:scoreId/override  (admin only)
router.patch(
  "/scores/:scoreId/override",
  requireScoreLeagueAdmin,
  validateBody(submitScoreSchema),
  scoreController.overrideScore
);

export default router;
