import { Request, Response } from "express";
import { asyncHandler, AppError } from "../middleware/error";
import { db } from "../config/db";
import { MailService } from "../services/mailService";
import { renderTemplate } from "../utils/mergeTokens";
import { ApplicationSource, ApplicationStatus } from "@prisma/client";

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

export const quickApply = asyncHandler(async (req: Request, res: Response) => {
  const { to, cc, subject, body, templateId } = req.body as {
    to?: string;
    cc?: string;
    subject?: string;
    body?: string;
    templateId?: string;
  };

  const parseEmails = (value?: string) =>
    (value || "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

  const toEmails = parseEmails(to);
  const ccEmails = parseEmails(cc);
  if (toEmails.length === 0 && ccEmails.length === 0) {
    throw new AppError("At least one recipient email is required", 400);
  }

  // Ensure every recipient exists as a recruiter so they appear in
  // Recruiters / Follow-ups / Applications pages
  const allEmails = [...toEmails, ...ccEmails];
  const recruiters: any[] = [];
  for (const email of allEmails) {
    const existing = await db.recruiter.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });
    recruiters.push(existing ?? (await db.recruiter.create({
      data: {
        name: email,
        email,
        company: email.split("@")[1]?.split(".")[0],
        source: ApplicationSource.DirectRecruiter,
      },
    })));
  }

  // Resolve template content (explicit templateId wins, else first active one)
  let template = templateId
    ? await db.template.findUnique({ where: { id: templateId } })
    : await db.template.findFirst({ where: { isActive: true } });

  const finalSubject = subject || template?.subjectTemplate || "Quick Apply";
  const finalBody = body || template?.bodyTemplate || "";

  // Send the email to every recipient (MailGun takes one "to" per call here,
  // so loop; cc is added to each message)
  let lastMessageId = "";
  for (const email of toEmails.length > 0 ? toEmails : ccEmails) {
    const result = await MailService.sendEmail({
      to: email,
      cc: ccEmails.join(","),
      subject: finalSubject,
      body: finalBody,
    });
    lastMessageId = result.messageId;
  }

  // Create a Draft application per recruiter so the send is traceable and
  // follow-ups hang off it
  const applications = [];
  for (const recruiter of recruiters) {
    const application = await db.application.create({
      data: {
        recruiterId: recruiter.id,
        templateId: template?.id,
        position: finalSubject,
        source: ApplicationSource.DirectRecruiter,
        status: ApplicationStatus.Applied,
        appliedDate: new Date(),
        messageId: lastMessageId,
        recipientEmail: recruiter.email,
        sentTimestamp: new Date(),
        remarks: "Created via Quick Apply",
      },
    });
    applications.push(application);
  }

  const primaryApplication = applications[0]!;

  await db.emailAudit.create({
    data: {
      applicationId: primaryApplication.id,
      messageId: lastMessageId,
      recipient: allEmails.join(","),
      subject: finalSubject,
    },
  });

  await db.followup.updateMany({
    where: { applicationId: primaryApplication.id, status: "Pending" },
    data: { status: "Sent", sentDate: new Date() },
  });

  await db.followup.create({
    data: {
      applicationId: primaryApplication.id,
      followupDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "Pending",
      notes: "Auto-created by Quick Apply",
    },
  });

  res.status(201).json({
    message: "Quick apply email sent",
    messageId: lastMessageId,
    recruiters: recruiters.map((r) => ({ id: r.id, email: r.email })),
    applicationIds: applications.map((a) => a.id),
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