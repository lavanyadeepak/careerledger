import { Request, Response } from "express";
import { asyncHandler, AppError } from "../middleware/error";
import { db } from "../config/db";
import ExcelJS from "exceljs";
import { stringify } from "csv-stringify/sync";

export const exportExcel = asyncHandler(async (req: Request, res: Response) => {
  const { company, recruiter, position, status, source, startDate, endDate } =
    req.query as {
      company?: string;
      recruiter?: string;
      position?: string;
      status?: string;
      source?: string;
      startDate?: string;
      endDate?: string;
    };

  const where: any = {};
  if (company) where.recruiter = { company: { contains: company, mode: "insensitive" } };
  if (recruiter) {
    where.recruiter = { ...where.recruiter, OR: [
      { name: { contains: recruiter, mode: "insensitive" } },
      { email: { contains: recruiter, mode: "insensitive" } },
    ]};
  }
  if (position) where.position = { contains: position, mode: "insensitive" };
  if (status) where.status = status;
  if (source) where.source = source;
  if (startDate || endDate) {
    where.appliedDate = {};
    if (startDate) where.appliedDate.gte = new Date(startDate);
    if (endDate) where.appliedDate.lte = new Date(endDate);
  }

  const applications = await db.application.findMany({
    where,
    orderBy: { appliedDate: "desc" },
    include: { recruiter: true, template: true, resume: true },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Applications");
  sheet.columns = [
    { header: "Position", key: "position", width: 30 },
    { header: "Company", key: "company", width: 30 },
    { header: "Recruiter", key: "recruiter", width: 30 },
    { header: "Source", key: "source", width: 20 },
    { header: "Status", key: "status", width: 20 },
    { header: "Applied Date", key: "appliedDate", width: 20 },
    { header: "Next Followup", key: "nextFollowupDate", width: 20 },
    { header: "Remarks", key: "remarks", width: 40 },
  ];

  applications.forEach((app) => {
    sheet.addRow({
      position: app.position,
      company: app.recruiter.company,
      recruiter: app.recruiter.name,
      source: app.source,
      status: app.status,
      appliedDate: app.appliedDate.toISOString().slice(0, 10),
      nextFollowupDate: app.nextFollowupDate ? app.nextFollowupDate.toISOString().slice(0, 10) : "",
      remarks: app.remarks || "",
    });
  });

  res.setHeader(
    "Content-Disposition",
    'attachment; filename="applications.xlsx"'
  );
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  await workbook.xlsx.write(res);
  res.end();
});

export const exportCsv = asyncHandler(async (req: Request, res: Response) => {
  const { company, recruiter, position, status, source, startDate, endDate } =
    req.query as {
      company?: string;
      recruiter?: string;
      position?: string;
      status?: string;
      source?: string;
      startDate?: string;
      endDate?: string;
    };

  const where: any = {};
  if (company) where.recruiter = { company: { contains: company, mode: "insensitive" } };
  if (recruiter) {
    where.recruiter = { ...where.recruiter, OR: [
      { name: { contains: recruiter, mode: "insensitive" } },
      { email: { contains: recruiter, mode: "insensitive" } },
    ]};
  }
  if (position) where.position = { contains: position, mode: "insensitive" };
  if (status) where.status = status;
  if (source) where.source = source;
  if (startDate || endDate) {
    where.appliedDate = {};
    if (startDate) where.appliedDate.gte = new Date(startDate);
    if (endDate) where.appliedDate.lte = new Date(endDate);
  }

  const applications = await db.application.findMany({
    where,
    orderBy: { appliedDate: "desc" },
    include: { recruiter: true },
  });

  const rows = applications.map((app) => ({
    position: app.position,
    company: app.recruiter.company,
    recruiter: app.recruiter.name,
    source: app.source,
    status: app.status,
    appliedDate: app.appliedDate.toISOString().slice(0, 10),
    nextFollowupDate: app.nextFollowupDate ? app.nextFollowupDate.toISOString().slice(0, 10) : "",
    remarks: app.remarks || "",
  }));

  const csv = stringify([{ ...rows[0] } , ...rows], { header: true, columns: Object.keys(rows[0] || {}) }) || "";

  res.setHeader("Content-Disposition", 'attachment; filename="applications.csv"');
  res.setHeader("Content-Type", "text/csv");
  res.send(csv);
});
