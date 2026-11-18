"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkGraphStatus = exports.handleGraphCallback = exports.getGraphAuthUrl = exports.sendEmail = void 0;
const error_1 = require("../middleware/error");
const db_1 = require("../config/db");
const graphService_1 = require("../services/graphService");
const mergeTokens_1 = require("../utils/mergeTokens");
exports.sendEmail = (0, error_1.asyncHandler)(async (req, res) => {
    const { applicationId, templateId, templateVersion, resumeId, mergeData, } = req.body;
    const application = await db_1.db.application.findUnique({
        where: { id: applicationId },
        include: { recruiter: true, template: true, resume: true },
    });
    if (!application) {
        throw new error_1.AppError("Application not found", 404);
    }
    const template = application.template;
    if (!template) {
        throw new error_1.AppError("No template linked to application", 400);
    }
    const subject = (0, mergeTokens_1.renderTemplate)(template.subjectTemplate, mergeData || {});
    const body = (0, mergeTokens_1.renderTemplate)(template.bodyTemplate, mergeData || {});
    const recipientEmail = application.recruiter.email;
    if (!recipientEmail) {
        throw new error_1.AppError("Recruiter has no email address", 400);
    }
    let attachmentPath;
    if (application.resume?.filePath) {
        attachmentPath = application.resume.filePath;
    }
    const result = await graphService_1.graphService.sendEmail({
        to: recipientEmail,
        subject,
        body,
        attachmentPath,
        attachmentName: application.resume?.resumeName,
    });
    // Capture message id and metadata only (no full body)
    await db_1.db.application.update({
        where: { id: applicationId },
        data: {
            status: "Applied",
            messageId: result.messageId,
            recipientEmail,
            sentTimestamp: new Date(),
            templateVersion: templateVersion ?? template.version,
        },
    });
    await db_1.db.emailAudit.create({
        data: {
            applicationId,
            messageId: result.messageId,
            recipient: recipientEmail,
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
    res.json({
        message: "Email sent",
        messageId: result.messageId,
        applicationId,
    });
});
exports.getGraphAuthUrl = (0, error_1.asyncHandler)(async (req, res) => {
    const url = graphService_1.graphService.getAuthUrl();
    res.json({ data: { authUrl: url } });
});
exports.handleGraphCallback = (0, error_1.asyncHandler)(async (req, res) => {
    const { code } = req.query;
    if (!code) {
        throw new error_1.AppError("Missing authorization code", 400);
    }
    await graphService_1.graphService.exchangeCodeForTokens(code);
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/settings?graph=connected`);
});
exports.checkGraphStatus = (0, error_1.asyncHandler)(async (req, res) => {
    const configured = Boolean(process.env.MS_GRAPH_CLIENT_ID &&
        process.env.MS_GRAPH_CLIENT_SECRET &&
        process.env.MS_GRAPH_SENDER_EMAIL);
    const token = await db_1.db.graphToken.findFirst();
    res.json({ data: { configured, connected: Boolean(token) } });
});
//# sourceMappingURL=emailController.js.map