import { db } from "../config/db";
import { ApplicationStatus } from "@prisma/client";

/**
 * Follow-up engine: auto-calculates follow-up dates (Applied + 7 days)
 * and identifies overdue / today / upcoming follow-ups for the dashboard.
 */
export async function autoScheduleFollowup(
  applicationId: string,
  appliedDate: Date
): Promise<void> {
  const nextFollowup = new Date(appliedDate.getTime() + 7 * 24 * 60 * 60 * 1000);

  await db.application.update({
    where: { id: applicationId },
    data: { nextFollowupDate: nextFollowup },
  });

  await db.followup.create({
    data: {
      applicationId,
      followupDate: nextFollowup,
      status: "Pending",
    },
  });
}

export async function getOverdueFollowups() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return db.followup.findMany({
    where: { status: "Pending", followupDate: { lt: todayStart } },
    orderBy: { followupDate: "asc" },
    include: { application: { include: { recruiter: true } } },
  });
}

export async function getTodaysFollowups() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return db.followup.findMany({
    where: { status: "Pending", followupDate: { gte: start, lt: end } },
    orderBy: { followupDate: "asc" },
    include: { application: { include: { recruiter: true } } },
  });
}

export async function getUpcomingFollowups(days = 7) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startEnd = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return db.followup.findMany({
    where: {
      status: "Pending",
      followupDate: { gte: startEnd, lte: end },
    },
    orderBy: { followupDate: "asc" },
    include: { application: { include: { recruiter: true } } },
  });
}

export async function markFollowupSent(followupId: string, messageId?: string) {
  return db.followup.update({
    where: { id: followupId },
    data: { status: "Sent", sentDate: new Date(), messageId },
  });
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus
) {
  return db.application.update({
    where: { id: applicationId },
    data: { status },
  });
}