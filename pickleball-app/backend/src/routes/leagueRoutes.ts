import { Router } from "express";
import * as leagueController from "../controllers/leagueController";
import * as matchController from "../controllers/matchController";
import * as standingsController from "../controllers/standingsController";
import * as bracketController from "../controllers/bracketController";
import { requireAuth, requireLeagueAdmin, requireLeagueMember } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import {
  createLeagueSchema,
  updateLeagueSchema,
  joinLeagueSchema,
  updateMemberSchema,
  createMatchSchema,
} from "../utils/schemas";

const router = Router();

router.use(requireAuth);

router.post("/", validateBody(createLeagueSchema), leagueController.createLeague);
router.get("/", leagueController.listMyLeagues);
router.post("/join", validateBody(joinLeagueSchema), leagueController.joinLeague);

router.get("/:id", requireLeagueMember, leagueController.getLeague);
router.patch("/:id", requireLeagueAdmin, validateBody(updateLeagueSchema), leagueController.updateLeague);

router.get("/:id/members", requireLeagueMember, leagueController.listMembers);
router.patch(
  "/:id/members/:userId",
  requireLeagueAdmin,
  validateBody(updateMemberSchema),
  leagueController.updateMember
);

router.get("/:id/matches", requireLeagueMember, matchController.listMatches);
router.post(
  "/:id/matches",
  requireLeagueAdmin,
  validateBody(createMatchSchema),
  matchController.createMatch
);
router.post("/:id/generate-schedule", requireLeagueAdmin, matchController.generateSchedule);

router.get("/:id/standings", requireLeagueMember, standingsController.standings);

router.post("/:id/bracket/generate", requireLeagueAdmin, bracketController.generateBracket);
router.get("/:id/bracket", requireLeagueMember, bracketController.getBracket);

export default router;
