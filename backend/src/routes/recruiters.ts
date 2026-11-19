import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as recruiterController from "../controllers/recruiterController";

const router = Router();

router.use(authenticate);

router.get("/", recruiterController.listRecruiters);
router.get("/:id", recruiterController.getRecruiter);
router.post("/", recruiterController.createRecruiter);
router.post("/bulk-add", recruiterController.bulkCreateRecruiters);
router.put("/:id", recruiterController.updateRecruiter);
router.delete("/:id", recruiterController.deleteRecruiter);
router.get("/:id/history", recruiterController.getRecruiterHistory);

export default router;