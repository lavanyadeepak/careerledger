import { Request, Response } from "express";
import { asyncHandler, AppError } from "../middleware/error";
import { db } from "../config/db";
import { AuthRequest } from "../middleware/auth";
import { ApplicationSource, ApplicationStatus } from "@prisma/client";

export const listApplications = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      company,
      recruiter,
      position,
      status,
      source,
      startDate,
      endDate,
      page = "1",
      limit = "20",
      sort = "appliedDate",
      order = "desc",
    } = req.query as {
      company?: string;
      recruiter?: string;
      position?: string;
      status?: string;
      source?: string;
      startDate?: string;
      endDate?: string;
      page: string;
      limit: string;
      sort: string;
      order: "asc" | "desc";
    };

    const where: any = {};
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
      if (startDate) where.appliedDate.gte = new Date(startDate);
      if (endDate) where.appliedDate.lte = new Date(endDate);
    }

    const [applications, total] = await Promise.all([
      db.application.findMany({
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
      db.application.count({ where }),
    ]);

    res.json({
      data: applications,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  }
);

export const getApplication = asyncHandler(async (req: Request, res: Response) => {
  const application = await db.application.findUnique({
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
    throw new AppError("Application not found", 404);
  }
  res.json({ data: application });
});

export const createApplication = asyncHandler(async (req: Request, res: Response) => {
  const {
    recruiterId,
    templateId,
    templateVersion,
    resumeId,
    position,
    location,
    source,
    appliedDate,
    status,
    nextFollowupDate,
    remarks,
    mergeData,
  } = req.body as {
    recruiterId: string;
    templateId?: string;
    templateVersion?: number;
    resumeId?: string;
    position: string;
    location?: string;
    source?: string;
    appliedDate?: string;
    status?: string;
    nextFollowupDate?: string;
    remarks?: string;
    mergeData?: Record<string, string>;
  };

  if (!recruiterId || !position) {
    throw new AppError("Recruiter and position are required", 400);
  }

  // Auto-calculate follow-up date: applied + 7 days if not specified
  const applied = appliedDate ? new Date(appliedDate) : new Date();
  const nextFollowup =
    nextFollowupDate || new Date(applied.getTime() + 7 * 24 * 60 * 60 * 1000);

  const application = await db.application.create({
    data: {
      recruiterId,
      templateId,
      templateVersion,
      resumeId,
      position,
      location,
      source: source as ApplicationSource | undefined,
      appliedDate: applied,
      status: (status as ApplicationStatus | undefined) || ApplicationStatus.Draft,
      nextFollowupDate: nextFollowup,
      remarks,
      mergeData: mergeData || {},
      createdBy: (req as any).user?.id,
    },
    include: { recruiter: true, template: true, resume: true },
  });

  // Auto-create follow-up record
  await db.followup.create({
    data: {
      applicationId: application.id,
      followupDate: nextFollowup,
      status: "Pending",
      createdBy: (req as any).user?.id,
    },
  });

  res.status(201).json({ data: application });
});

export const updateApplication = asyncHandler(async (req: Request, res: Response) => {
  const {
    templateId,
    templateVersion,
    resumeId,
    position,
    location,
    source,
    status,
    nextFollowupDate,
    remarks,
    mergeData,
    messageId,
    recipientEmail,
    sentTimestamp,
  } = req.body as {
    templateId?: string;
    templateVersion?: number;
    resumeId?: string;
    position?: string;
    location?: string;
    source?: string;
    status?: string;
    nextFollowupDate?: string;
    remarks?: string;
    mergeData?: Record<string, string>;
    messageId?: string;
    recipientEmail?: string;
    sentTimestamp?: string;
  };

  const application = await db.application.update({
    where: { id: req.params.id },
    data: {
      templateId,
      templateVersion,
      resumeId,
      position,
      location,
      source: source as ApplicationSource | undefined,
      status: status as ApplicationStatus | undefined,
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

export const deleteApplication = asyncHandler(async (req: Request, res: Response) => {
  await db.application.delete({ where: { id: req.params.id } });
  res.json({ message: "Application deleted" });
});
