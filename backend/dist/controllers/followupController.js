"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFollowup = exports.updateFollowup = exports.createFollowup = exports.getFollowup = exports.listFollowups = void 0;
const error_1 = require("../middleware/error");
const db_1 = require("../config/db");
exports.listFollowups = (0, error_1.asyncHandler)(async (req, res) => {
    const { status, overdue, today, upcoming } = req.query;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const where = {};
    if (status)
        where.status = status;
    let followups;
    if (overdue === "true") {
        where.followupDate = { lt: todayStart };
        where.status = "Pending";
        followups = await db_1.db.followup.findMany({
            where,
            orderBy: { followupDate: "asc" },
            include: { application: { include: { recruiter: true } } },
        });
    }
    else if (today === "true") {
        where.followupDate = { gte: todayStart, lt: todayEnd };
        followups = await db_1.db.followup.findMany({
            where,
            orderBy: { followupDate: "asc" },
            include: { application: { include: { recruiter: true } } },
        });
    }
    else if (upcoming === "true") {
        where.followupDate = { gte: todayEnd, lte: sevenDaysLater };
        where.status = "Pending";
        followups = await db_1.db.followup.findMany({
            where,
            orderBy: { followupDate: "asc" },
            include: { application: { include: { recruiter: true } } },
        });
    }
    else {
        followups = await db_1.db.followup.findMany({
            where,
            orderBy: { followupDate: "asc" },
            include: { application: { include: { recruiter: true } } },
        });
    }
    res.json({ data: followups });
});
exports.getFollowup = (0, error_1.asyncHandler)(async (req, res) => {
    const followup = await db_1.db.followup.findUnique({
        where: { id: req.params.id },
        include: { application: { include: { recruiter: true } } },
    });
    if (!followup) {
        throw new error_1.AppError("Followup not found", 404);
    }
    res.json({ data: followup });
});
exports.createFollowup = (0, error_1.asyncHandler)(async (req, res) => {
    const { applicationId, followupDate, status, notes } = req.body;
    if (!applicationId || !followupDate) {
        throw new error_1.AppError("Application and followup date are required", 400);
    }
    const followup = await db_1.db.followup.create({
        data: {
            applicationId,
            followupDate: new Date(followupDate),
            status: status || "Pending",
            notes,
        },
    });
    res.status(201).json({ data: followup });
});
exports.updateFollowup = (0, error_1.asyncHandler)(async (req, res) => {
    const { followupDate, status, notes, sentDate } = req.body;
    const followup = await db_1.db.followup.update({
        where: { id: req.params.id },
        data: {
            followupDate: followupDate ? new Date(followupDate) : undefined,
            status,
            notes,
            sentDate: sentDate ? new Date(sentDate) : undefined,
        },
    });
    res.json({ data: followup });
});
exports.deleteFollowup = (0, error_1.asyncHandler)(async (req, res) => {
    await db_1.db.followup.delete({ where: { id: req.params.id } });
    res.json({ message: "Followup deleted" });
});
//# sourceMappingURL=followupController.js.map