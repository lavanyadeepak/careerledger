import { Router } from "express";
import * as mailController from "../controllers/mailController";

const router = Router();

// MailGun status check - verifies if MailGun is configured
router.get("/status", mailController.checkMailgunStatus);

// MailGun connection - configure API key (no OAuth needed, just set in .env)
router.get("/login", mailController.getMailgunAuthUrl);

export default router;