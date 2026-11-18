import { Request, Response } from "express";
import { asyncHandler, AppError } from "../middleware/error";
import { db } from "../config/db";
import { MailService } from "../services/mailService";
import { renderTemplate } from "../utils/mergeTokens";

export const sendEmail = asyncHandler(async (req: Request, res: Response) => {
  const {
    applicationId,
    templateId,
    templateVersion,
    resumeId,
    mergeData,
  } = req.body as {
    applicationId: string;
    templateId?: string;
    templateVersion?: number;
    resumeId?: string;
    mergeData?: Record<string, string>;
  };

  const application = await db.application.findUnique({
    where: { id: applicationId },
    include: { recruiter: true, template: true, resume: true },
  });
  if (!application) {
    throw new AppError("Application not found", 404);
  }

  const template = application.template;
  if (!template) {
    throw new AppError("No template linked to application", 400);
  }

  const subject = renderTemplate(template.subjectTemplate, mergeData || {});
  const body = renderTemplate(template.bodyTemplate, mergeData || {});
  const recipientEmail = application.recruiter.email;
  if (!recipientEmail) {
    throw new AppError("Recruiter has no email address", 400);
  }

  let attachmentPath: string | undefined;
  if (application.resume?.filePath) {
    attachmentPath = application.resume.filePath;
  }

  const result = await MailService.sendEmail({
    to: recipientEmail,
    subject,
    body,
    attachmentPath,
    attachmentName: application.resume?.resumeName,
  });

  // Capture message id and metadata only (no full body)
  await db.application.update({
    where: { id: applicationId },
    data: {
      status: "Applied",
      messageId: result.messageId,
      recipientEmail,
      sentTimestamp: new Date(),
      templateVersion: templateVersion ?? template.version,
    },
  });

  await db.emailAudit.create({
    data: {
      applicationId,
      messageId: result.messageId,
      recipient: recipientEmail,
      subject,
    },
  });

  await db.followup.updateMany({
    where: { applicationId, status: "Pending" },
    data: { status: "Sent", sentDate: new Date() },
  });

  await db.followup.create({
    data: {
      applicationId,
      followupDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "Pending",
    },
  });

  res.json({
    message: "Email sent",
    messageId: result.messageId,
    applicationId,
  });
});

export const getGraphAuthUrl = asyncHandler(async (req: Request, res: Response) => {
  res.json({ data: { message: "MailGun is used instead of Microsoft Graph. No auth URL needed." } });
});

export const handleGraphCallback = asyncHandler(async (req: Request, res: Response) => {
  res.json({ data: { message: "MailGun is used instead of Microsoft Graph. No callback needed." } });
});

export const checkGraphStatus = asyncHandler(async (req: Request, res: Response) => {
  const configured = Boolean(
    process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN && process.env.MAIL_FROM
  );
  res.json({ data: { configured } });
});