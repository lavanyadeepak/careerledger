import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as emailController from "../controllers/emailController";

const router = Router();

router.post("/send", authenticate, emailController.sendEmail);
router.get("/graph/login", authenticate, emailController.getGraphAuthUrl);
router.get("/graph/callback", emailController.handleGraphCallback);
router.get("/graph/status", authenticate, emailController.checkGraphStatus);

export default router;