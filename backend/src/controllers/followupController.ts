import { Request, Response } from "express";
import { asyncHandler, AppError } from "../middleware/error";
import { db } from "../config/db";

export const listFollowups = asyncHandler(async (req: Request, res: Response) => {
  const { status, overdue, today, upcoming } = req.query as {
    status?: string;
    overdue?: string;
    today?: string;
    upcoming?: string;
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const where: any = {};
  if (status) where.status = status;

  let followups;
  if (overdue === "true") {
    where.followupDate = { lt: todayStart };
    where.status = "Pending";
    followups = await db.followup.findMany({
      where,
      orderBy: { followupDate: "asc" },
      include: { application: { include: { recruiter: true } } },
    });
  } else if (today === "true") {
    where.followupDate = { gte: todayStart, lt: todayEnd };
    followups = await db.followup.findMany({
      where,
      orderBy: { followupDate: "asc" },
      include: { application: { include: { recruiter: true } } },
    });
  } else if (upcoming === "true") {
    where.followupDate = { gte: todayEnd, lte: sevenDaysLater };
    where.status = "Pending";
    followups = await db.followup.findMany({
      where,
      orderBy: { followupDate: "asc" },
      include: { application: { include: { recruiter: true } } },
    });
  } else {
    followups = await db.followup.findMany({
      where,
      orderBy: { followupDate: "asc" },
      include: { application: { include: { recruiter: true } } },
    });
  }

  res.json({ data: followups });
});

export const getFollowup = asyncHandler(async (req: Request, res: Response) => {
  const followup = await db.followup.findUnique({
    where: { id: req.params.id },
    include: { application: { include: { recruiter: true } } },
  });
  if (!followup) {
    throw new AppError("Followup not found", 404);
  }
  res.json({ data: followup });
});

export const createFollowup = asyncHandler(async (req: Request, res: Response) => {
  const { applicationId, followupDate, status, notes } = req.body as {
    applicationId: string;
    followupDate: string;
    status?: string;
    notes?: string;
  };

  if (!applicationId || !followupDate) {
    throw new AppError("Application and followup date are required", 400);
  }

  const followup = await db.followup.create({
    data: {
      applicationId,
      followupDate: new Date(followupDate),
      status: status || "Pending",
      notes,
    },
  });
  res.status(201).json({ data: followup });
});

export const updateFollowup = asyncHandler(async (req: Request, res: Response) => {
  const { followupDate, status, notes, sentDate } = req.body as {
    followupDate?: string;
    status?: string;
    notes?: string;
    sentDate?: string;
  };

  const followup = await db.followup.update({
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

export const deleteFollowup = asyncHandler(async (req: Request, res: Response) => {
  await db.followup.delete({ where: { id: req.params.id } });
  res.json({ message: "Followup deleted" });
});