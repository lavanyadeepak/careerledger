import { Request, Response } from "express";
import { asyncHandler, AppError } from "../middleware/error";
import { db } from "../config/db";
import { AuthRequest } from "../middleware/auth";
import { ApplicationSource } from "@prisma/client";

export const listRecruiters = asyncHandler(
  async (req: Request, res: Response) => {
    const { search, company, page = "1", limit = "20" } = req.query as {
      search?: string;
      company?: string;
      page: string;
      limit: string;
    };

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ];
    }
    if (company) {
      where.company = { contains: company, mode: "insensitive" };
    }

    const [recruiters, total] = await Promise.all([
      db.recruiter.findMany({
        where,
        orderBy: { createdDate: "desc" },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        include: {
          _count: { select: { applications: true } },
        },
      }),
      db.recruiter.count({ where }),
    ]);

    res.json({
      data: recruiters,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  }
);

export const getRecruiter = asyncHandler(async (req: Request, res: Response) => {
  const recruiter = await db.recruiter.findUnique({
    where: { id: req.params.id },
    include: {
      applications: {
        orderBy: { appliedDate: "desc" },
        include: { template: true, resume: true },
      },
    },
  });
  if (!recruiter) {
    throw new AppError("Recruiter not found", 404);
  }
  res.json({ data: recruiter });
});

export const createRecruiter = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, designation, company, linkedInUrl, phone, source, notes } =
      req.body as {
        name: string;
        email?: string;
        designation?: string;
        company?: string;
        linkedInUrl?: string;
        phone?: string;
        source?: string;
        notes?: string;
      };

    if (!name) {
      throw new AppError("Name is required", 400);
    }

    const recruiter = await db.recruiter.create({
      data: {
        name,
        email,
        designation,
        company,
        linkedInUrl,
        phone,
        source: source as ApplicationSource | undefined,
        notes,
      },
    });
    res.status(201).json({ data: recruiter });
  }
);

export const bulkCreateRecruiters = asyncHandler(
  async (req: Request, res: Response) => {
    const { emails } = req.body as { emails?: string[] };

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      throw new AppError("At least one email is required", 400);
    }

    const created = [];
    for (const email of emails) {
      const trimmed = (email || "").trim();
      if (!trimmed) continue;

      // Skip recruiters that already exist with the same email
      const existing = await db.recruiter.findFirst({
        where: { email: { equals: trimmed, mode: "insensitive" } },
      });
      if (existing) {
        created.push(existing);
        continue;
      }

      const domainPart = trimmed.split("@")[1] || "";
      const recruiter = await db.recruiter.create({
        data: {
          name: trimmed,
          email: trimmed,
          company: domainPart ? domainPart.split(".")[0] : undefined,
          source: ApplicationSource.DirectRecruiter,
        },
      });
      created.push(recruiter);
    }

    res.status(201).json({ data: created });
  }
);

export const updateRecruiter = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, designation, company, linkedInUrl, phone, source, notes } =
    req.body as {
      name?: string;
      email?: string;
      designation?: string;
      company?: string;
      linkedInUrl?: string;
      phone?: string;
      source?: string;
      notes?: string;
    };

  const recruiter = await db.recruiter.update({
    where: { id: req.params.id },
    data: { name, email, designation, company, linkedInUrl, phone, source: source as ApplicationSource | undefined, notes },
  });
  res.json({ data: recruiter });
});

export const deleteRecruiter = asyncHandler(async (req: Request, res: Response) => {
  await db.recruiter.delete({ where: { id: req.params.id } });
  res.json({ message: "Recruiter deleted" });
});

export const getRecruiterHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const applications = await db.application.findMany({
      where: { recruiterId: req.params.id },
      orderBy: { appliedDate: "desc" },
      include: { template: true, resume: true, followups: true },
    });
    res.json({ data: applications });
  }
);
