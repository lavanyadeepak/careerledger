import { Request, Response } from "express";
import { asyncHandler } from "../middleware/error";
import { db } from "../config/db";

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const [
    totalApplications,
    responsesReceived,
    interviewsScheduled,
    offersReceived,
    rejections,
    pendingFollowups,
    byStatus,
  ] = await Promise.all([
    db.application.count(),
    db.application.count({
      where: { status: { not: "Draft" } },
    }),
    db.application.count({
      where: { status: { in: ["InterviewScheduled", "TechnicalRound", "HRRound"] } },
    }),
    db.application.count({ where: { status: "OfferReceived" } }),
    db.application.count({ where: { status: "Rejected" } }),
    db.followup.count({ where: { status: "Pending", followupDate: { lt: new Date() } } }),
    db.application.groupBy({
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
      byStatus: byStatus.reduce((acc: any, item: any) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {}),
    },
  });
});

export const getApplicationsByMonth = asyncHandler(
  async (req: Request, res: Response) => {
    const { months = "12" } = req.query as { months?: string };
    const count = parseInt(months, 10);
    const from = new Date();
    from.setMonth(from.getMonth() - count + 1);
    from.setDate(1);

    const data = await db.application.findMany({
      where: { appliedDate: { gte: from } },
      select: { appliedDate: true, status: true },
    });

    const byMonth: Record<string, number> = {};
    data.forEach((app) => {
      const key = app.appliedDate.toISOString().slice(0, 7); // YYYY-MM
      byMonth[key] = (byMonth[key] || 0) + 1;
    });

    res.json({ data: Object.entries(byMonth).map(([month, count]) => ({ month, count })) });
  }
);

export const getCompanyWise = asyncHandler(async (req: Request, res: Response) => {
  const data = await db.application.groupBy({
    by: ["recruiterId"],
    _count: { id: true },
  });

  // Fetch recruiter names
  const recruiterIds = data.map((d) => d.recruiterId);
  const recruiters = await db.recruiter.findMany({
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

export const getStatusDistribution = asyncHandler(async (req: Request, res: Response) => {
  const data = await db.application.groupBy({
    by: ["status"],
    _count: { status: true },
  });
  res.json({
    data: data.map((d) => ({ status: d.status, count: d._count.status })),
  });
});

export const getDashboardFollowups = asyncHandler(async (req: Request, res: Response) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [overdue, today, upcoming] = await Promise.all([
    db.followup.findMany({
      where: { status: "Pending", followupDate: { lt: todayStart } },
      orderBy: { followupDate: "asc" },
      include: { application: { include: { recruiter: true } } },
    }),
    db.followup.findMany({
      where: { status: "Pending", followupDate: { gte: todayStart, lt: todayEnd } },
      orderBy: { followupDate: "asc" },
      include: { application: { include: { recruiter: true } } },
    }),
    db.followup.findMany({
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
