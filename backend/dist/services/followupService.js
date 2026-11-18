"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoScheduleFollowup = autoScheduleFollowup;
exports.getOverdueFollowups = getOverdueFollowups;
exports.getTodaysFollowups = getTodaysFollowups;
exports.getUpcomingFollowups = getUpcomingFollowups;
exports.markFollowupSent = markFollowupSent;
exports.updateApplicationStatus = updateApplicationStatus;
const db_1 = require("../config/db");
/**
 * Follow-up engine: auto-calculates follow-up dates (Applied + 7 days)
 * and identifies overdue / today / upcoming follow-ups for the dashboard.
 */
async function autoScheduleFollowup(applicationId, appliedDate) {
    const nextFollowup = new Date(appliedDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    await db_1.db.application.update({
        where: { id: applicationId },
        data: { nextFollowupDate: nextFollowup },
    });
    await db_1.db.followup.create({
        data: {
            applicationId,
            followupDate: nextFollowup,
            status: "Pending",
        },
    });
}
async function getOverdueFollowups() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return db_1.db.followup.findMany({
        where: { status: "Pending", followupDate: { lt: todayStart } },
        orderBy: { followupDate: "asc" },
        include: { application: { include: { recruiter: true } } },
    });
}
async function getTodaysFollowups() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return db_1.db.followup.findMany({
        where: { status: "Pending", followupDate: { gte: start, lt: end } },
        orderBy: { followupDate: "asc" },
        include: { application: { include: { recruiter: true } } },
    });
}
async function getUpcomingFollowups(days = 7) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startEnd = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return db_1.db.followup.findMany({
        where: {
            status: "Pending",
            followupDate: { gte: startEnd, lte: end },
        },
        orderBy: { followupDate: "asc" },
        include: { application: { include: { recruiter: true } } },
    });
}
async function markFollowupSent(followupId, messageId) {
    return db_1.db.followup.update({
        where: { id: followupId },
        data: { status: "Sent", sentDate: new Date(), messageId },
    });
}
async function updateApplicationStatus(applicationId, status) {
    return db_1.db.application.update({
        where: { id: applicationId },
        data: { status },
    });
}
//# sourceMappingURL=followupService.js.map