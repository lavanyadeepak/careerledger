"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardFollowups = exports.getStatusDistribution = exports.getCompanyWise = exports.getApplicationsByMonth = exports.getStats = void 0;
const error_1 = require("../middleware/error");
const db_1 = require("../config/db");
exports.getStats = (0, error_1.asyncHandler)(async (req, res) => {
    const [totalApplications, responsesReceived, interviewsScheduled, offersReceived, rejections, pendingFollowups, byStatus,] = await Promise.all([
        db_1.db.application.count(),
        db_1.db.application.count({
            where: { status: { not: "Draft" } },
        }),
        db_1.db.application.count({
            where: { status: { in: ["InterviewScheduled", "TechnicalRound", "HRRound"] } },
        }),
        db_1.db.application.count({ where: { status: "OfferReceived" } }),
        db_1.db.application.count({ where: { status: "Rejected" } }),
        db_1.db.followup.count({ where: { status: "Pending", followupDate: { lt: new Date() } } }),
        db_1.db.application.groupBy({
            by: ["status"],
            _count: { status: true },
        }),
    ]);
    res.json({
        data: {
            totalApplications,
            responsesReceived,
            interviewsScheduled,
            offersReceived,
            rejections,
            pendingFollowups,
            byStatus: byStatus.reduce((acc, item) => {
                acc[item.status] = item._count.status;
                return acc;
            }, {}),
        },
    });
});
exports.getApplicationsByMonth = (0, error_1.asyncHandler)(async (req, res) => {
    const { months = "12" } = req.query;
    const count = parseInt(months, 10);
    const from = new Date();
    from.setMonth(from.getMonth() - count + 1);
    from.setDate(1);
    const data = await db_1.db.application.findMany({
        where: { appliedDate: { gte: from } },
        select: { appliedDate: true, status: true },
    });
    const byMonth = {};
    data.forEach((app) => {
        const key = app.appliedDate.toISOString().slice(0, 7); // YYYY-MM
        byMonth[key] = (byMonth[key] || 0) + 1;
    });
    res.json({ data: Object.entries(byMonth).map(([month, count]) => ({ month, count })) });
});
exports.getCompanyWise = (0, error_1.asyncHandler)(async (req, res) => {
    const data = await db_1.db.application.groupBy({
        by: ["recruiterId"],
        _count: { id: true },
    });
    // Fetch recruiter names
    const recruiterIds = data.map((d) => d.recruiterId);
    const recruiters = await db_1.db.recruiter.findMany({
        where: { id: { in: recruiterIds } },
        select: { id: true, company: true, name: true },
    });
    const map = new Map(recruiters.map((r) => [r.id, r]));
    const result = data
        .map((d) => {
        const r = map.get(d.recruiterId);
        return {
            company: r?.company || r?.name || "Unknown",
            recruiter: r?.name || "Unknown",
            count: d._count.id,
        };
    })
        .sort((a, b) => b.count - a.count);
    res.json({ data: result });
});
exports.getStatusDistribution = (0, error_1.asyncHandler)(async (req, res) => {
    const data = await db_1.db.application.groupBy({
        by: ["status"],
        _count: { status: true },
    });
    res.json({
        data: data.map((d) => ({ status: d.status, count: d._count.status })),
    });
});
exports.getDashboardFollowups = (0, error_1.asyncHandler)(async (req, res) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const [overdue, today, upcoming] = await Promise.all([
        db_1.db.followup.findMany({
            where: { status: "Pending", followupDate: { lt: todayStart } },
            orderBy: { followupDate: "asc" },
            include: { application: { include: { recruiter: true } } },
        }),
        db_1.db.followup.findMany({
            where: { status: "Pending", followupDate: { gte: todayStart, lt: todayEnd } },
            orderBy: { followupDate: "asc" },
            include: { application: { include: { recruiter: true } } },
        }),
        db_1.db.followup.findMany({
            where: {
                status: "Pending",
                followupDate: { gte: todayEnd, lte: sevenDaysLater },
            },
            orderBy: { followupDate: "asc" },
            include: { application: { include: { recruiter: true } } },
        }),
    ]);
    res.json({ data: { overdue, today, upcoming } });
});
//# sourceMappingURL=dashboardController.js.map