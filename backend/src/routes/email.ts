import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as emailController from "../controllers/emailController";

const router = Router();

router.post("/send", authenticate, emailController.sendEmail);
router.post("/quick-apply", authenticate, emailController.quickApply);

export default router;