import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as applicationController from "../controllers/applicationController";

const router = Router();

router.use(authenticate);

router.get("/", applicationController.listApplications);
router.get("/:id", applicationController.getApplication);
router.post("/", applicationController.createApplication);
router.put("/:id", applicationController.updateApplication);
router.delete("/:id", applicationController.deleteApplication);

export default router;