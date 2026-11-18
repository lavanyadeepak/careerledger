import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as resumeController from "../controllers/resumeController";

const router = Router();

router.use(authenticate);

router.get("/", resumeController.listResumes);
router.get("/:id", resumeController.getResume);
router.post("/", resumeController.createResume);
router.delete("/:id", resumeController.deleteResume);

export default router;