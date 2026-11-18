/**
 * Email service orchestrates sending via Microsoft Graph.
 * Only metadata (MessageId, recipient, subject, sent date) is persisted.
 * Full email bodies are NOT stored - they are reconstructed from Template + MergeData.
 */
import { db } from "../config/db";
import { graphService } from "./graphService";
import { renderTemplate } from "../utils/mergeTokens";

export interface EmailResult {
  messageId: string;
  recipient: string;
  subject: string;
  sentAt: Date;
}

export async function sendApplicationEmail(
  applicationId: string,
  mergeData: Record<string, string>
): Promise<EmailResult> {
  const application = await db.application.findUnique({
    where: { id: applicationId },
    include: { recruiter: true, template: true, resume: true },
  });

  if (!application) {
    throw new Error("Application not found");
  }
  if (!application.template) {
    throw new Error("No email template linked to application");
  }
  if (!application.recruiter.email) {
    throw new Error("Recruiter has no email address");
  }

  const subject = renderTemplate(application.template.subjectTemplate, mergeData);
  const body = renderTemplate(application.template.bodyTemplate, mergeData);

  const result = await graphService.sendEmail({
    to: application.recruiter.email,
    subject,
    body,
    attachmentPath: application.resume?.filePath,
    attachmentName: application.resume?.resumeName,
  });

  await db.application.update({
    where: { id: applicationId },
    data: {
      status: "Applied",
      messageId: result.messageId,
      recipientEmail: application.recruiter.email,
      sentTimestamp: new Date(),
    },
  });

  await db.emailAudit.create({
    data: {
      applicationId,
      messageId: result.messageId,
      recipient: application.recruiter.email,
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

  return {
    messageId: result.messageId,
    recipient: application.recruiter.email,
    subject,
    sentAt: new Date(),
  };
}