import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as followupController from "../controllers/followupController";

const router = Router();

router.use(authenticate);

router.get("/", followupController.listFollowups);
router.get("/:id", followupController.getFollowup);
router.post("/", followupController.createFollowup);
router.put("/:id", followupController.updateFollowup);
router.delete("/:id", followupController.deleteFollowup);

export default router;