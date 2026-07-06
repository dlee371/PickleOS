import { Router } from "express";
import * as userController from "../controllers/userController";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { updateProfileSchema } from "../utils/schemas";

const router = Router();

router.use(requireAuth);

// NOTE: /me must be registered before /:id or Express will treat "me" as an :id param
router.patch("/me", validateBody(updateProfileSchema), userController.updateMe);
router.get("/:id", userController.getUser);

export default router;
