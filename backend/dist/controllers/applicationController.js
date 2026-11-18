"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteApplication = exports.updateApplication = exports.createApplication = exports.getApplication = exports.listApplications = void 0;
const error_1 = require("../middleware/error");
const db_1 = require("../config/db");
const client_1 = require("@prisma/client");
exports.listApplications = (0, error_1.asyncHandler)(async (req, res) => {
    const { company, recruiter, position, status, source, startDate, endDate, page = "1", limit = "20", sort = "appliedDate", order = "desc", } = req.query;
    const where = {};
    if (company) {
        where.recruiter = { company: { contains: company, mode: "insensitive" } };
    }
    if (recruiter) {
        where.recruiter = {
            ...where.recruiter,
            OR: [
                { name: { contains: recruiter, mode: "insensitive" } },
                { email: { contains: recruiter, mode: "insensitive" } },
            ],
        };
    }
    if (position) {
        where.position = { contains: position, mode: "insensitive" };
    }
    if (status) {
        where.status = status;
    }
    if (source) {
        where.source = source;
    }
    if (startDate || endDate) {
        where.appliedDate = {};
        if (startDate)
            where.appliedDate.gte = new Date(startDate);
        if (endDate)
            where.appliedDate.lte = new Date(endDate);
    }
    const [applications, total] = await Promise.all([
        db_1.db.application.findMany({
            where,
            orderBy: { [sort]: order },
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit),
            include: {
                recruiter: true,
                template: true,
                resume: true,
                followups: { orderBy: { followupDate: "asc" } },
            },
        }),
        db_1.db.application.count({ where }),
    ]);
    res.json({
        data: applications,
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
});
exports.getApplication = (0, error_1.asyncHandler)(async (req, res) => {
    const application = await db_1.db.application.findUnique({
        where: { id: req.params.id },
        include: {
            recruiter: true,
            template: true,
            resume: true,
            followups: { orderBy: { followupDate: "asc" } },
            emailAudit: { orderBy: { sentDate: "desc" } },
        },
    });
    if (!application) {
        throw new error_1.AppError("Application not found", 404);
    }
    res.json({ data: application });
});
exports.createApplication = (0, error_1.asyncHandler)(async (req, res) => {
    const { recruiterId, templateId, templateVersion, resumeId, position, location, source, appliedDate, status, nextFollowupDate, remarks, mergeData, } = req.body;
    if (!recruiterId || !position) {
        throw new error_1.AppError("Recruiter and position are required", 400);
    }
    // Auto-calculate follow-up date: applied + 7 days if not specified
    const applied = appliedDate ? new Date(appliedDate) : new Date();
    const nextFollowup = nextFollowupDate || new Date(applied.getTime() + 7 * 24 * 60 * 60 * 1000);
    const application = await db_1.db.application.create({
        data: {
            recruiterId,
            templateId,
            templateVersion,
            resumeId,
            position,
            location,
            source: source,
            appliedDate: applied,
            status: status || client_1.ApplicationStatus.Draft,
            nextFollowupDate: nextFollowup,
            remarks,
            mergeData: mergeData || {},
            createdBy: req.user?.id,
        },
        include: { recruiter: true, template: true, resume: true },
    });
    // Auto-create follow-up record
    await db_1.db.followup.create({
        data: {
            applicationId: application.id,
            followupDate: nextFollowup,
            status: "Pending",
            createdBy: req.user?.id,
        },
    });
    res.status(201).json({ data: application });
});
exports.updateApplication = (0, error_1.asyncHandler)(async (req, res) => {
    const { templateId, templateVersion, resumeId, position, location, source, status, nextFollowupDate, remarks, mergeData, messageId, recipientEmail, sentTimestamp, } = req.body;
    const application = await db_1.db.application.update({
        where: { id: req.params.id },
        data: {
            templateId,
            templateVersion,
            resumeId,
            position,
            location,
            source: source,
            status: status,
            nextFollowupDate: nextFollowupDate ? new Date(nextFollowupDate) : undefined,
            remarks,
            mergeData,
            messageId,
            recipientEmail,
            sentTimestamp: sentTimestamp ? new Date(sentTimestamp) : undefined,
        },
        include: { recruiter: true, template: true, resume: true },
    });
    res.json({ data: application });
});
exports.deleteApplication = (0, error_1.asyncHandler)(async (req, res) => {
    await db_1.db.application.delete({ where: { id: req.params.id } });
    res.json({ message: "Application deleted" });
});
//# sourceMappingURL=applicationController.js.map