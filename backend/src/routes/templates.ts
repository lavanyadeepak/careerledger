import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as templateController from "../controllers/templateController";

const router = Router();

router.use(authenticate);

router.get("/", templateController.listTemplates);
router.get("/:id", templateController.getTemplate);
router.post("/", templateController.createTemplate);
router.put("/:id", templateController.updateTemplate);
router.delete("/:id", templateController.deleteTemplate);
router.post("/render", templateController.renderTemplatePreview);

export default router;