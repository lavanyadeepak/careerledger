"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendApplicationEmail = sendApplicationEmail;
/**
 * Email service orchestrates sending via Microsoft Graph.
 * Only metadata (MessageId, recipient, subject, sent date) is persisted.
 * Full email bodies are NOT stored - they are reconstructed from Template + MergeData.
 */
const db_1 = require("../config/db");
const graphService_1 = require("./graphService");
const mergeTokens_1 = require("../utils/mergeTokens");
async function sendApplicationEmail(applicationId, mergeData) {
    const application = await db_1.db.application.findUnique({
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
    const subject = (0, mergeTokens_1.renderTemplate)(application.template.subjectTemplate, mergeData);
    const body = (0, mergeTokens_1.renderTemplate)(application.template.bodyTemplate, mergeData);
    const result = await graphService_1.graphService.sendEmail({
        to: application.recruiter.email,
        subject,
        body,
        attachmentPath: application.resume?.filePath,
        attachmentName: application.resume?.resumeName,
    });
    await db_1.db.application.update({
        where: { id: applicationId },
        data: {
            status: "Applied",
            messageId: result.messageId,
            recipientEmail: application.recruiter.email,
            sentTimestamp: new Date(),
        },
    });
    await db_1.db.emailAudit.create({
        data: {
            applicationId,
            messageId: result.messageId,
            recipient: application.recruiter.email,
            subject,
        },
    });
    await db_1.db.followup.updateMany({
        where: { applicationId, status: "Pending" },
        data: { status: "Sent", sentDate: new Date() },
    });
    await db_1.db.followup.create({
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
//# sourceMappingURL=emailService.js.map