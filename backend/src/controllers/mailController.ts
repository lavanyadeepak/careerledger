import { Request, Response } from "express";
import { asyncHandler, AppError } from "../middleware/error";
import { MailService } from "../services/mailService";
import { env } from "../config/env";

const getMailgunStatus = () => {
  const configured = Boolean(env.mailgunApiKey && env.mailgunDomain && env.mailFrom);
  return { configured, connected: configured };
};

export const checkMailgunStatus = asyncHandler(async (req: Request, res: Response) => {
  res.json({ data: getMailgunStatus() });
});

export const getMailgunAuthUrl = asyncHandler(async (req: Request, res: Response) => {
  const status = getMailgunStatus();
  res.json({
    data: {
      ...status,
      message: status.configured
        ? "Mailgun is configured."
        : "Configure MAILGUN_API_KEY, MAILGUN_DOMAIN, and MAIL_FROM in backend/.env",
    },
  });
});
