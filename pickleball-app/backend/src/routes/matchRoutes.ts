import { Router } from "express";
import * as matchController from "../controllers/matchController";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { updateMatchSchema } from "../utils/schemas";
import { requireMatchLeagueAdmin } from "../middleware/matchAuth";

const router = Router();

router.use(requireAuth);

router.patch("/:matchId", requireMatchLeagueAdmin, validateBody(updateMatchSchema), matchController.updateMatch);

export default router;
