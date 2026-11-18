import { Request, Response } from "express";
import { asyncHandler, AppError } from "../middleware/error";
import { db } from "../config/db";

export const listResumes = asyncHandler(async (req: Request, res: Response) => {
  const resumes = await db.resume.findMany({
    orderBy: [{ isDefault: "desc" }, { createdDate: "desc" }],
  });
  res.json({ data: resumes });
});

export const getResume = asyncHandler(async (req: Request, res: Response) => {
  const resume = await db.resume.findUnique({
    where: { id: req.params.id },
  });
  if (!resume) {
    throw new AppError("Resume not found", 404);
  }
  res.json({ data: resume });
});

export const createResume = asyncHandler(async (req: Request, res: Response) => {
  const { resumeName, version, filePath, fileSize, mimeType, isDefault } =
    req.body as {
      resumeName: string;
      version?: string;
      filePath: string;
      fileSize?: number;
      mimeType?: string;
      isDefault?: boolean;
    };

  if (!resumeName || !filePath) {
    throw new AppError("Resume name and file path are required", 400);
  }

  // If this is default, unset others
  if (isDefault) {
    await db.resume.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
  }

  const resume = await db.resume.create({
    data: { resumeName, version: version ?? "1.0", filePath, fileSize, mimeType, isDefault: isDefault ?? false },
  });
  res.status(201).json({ data: resume });
});

export const deleteResume = asyncHandler(async (req: Request, res: Response) => {
  await db.resume.delete({ where: { id: req.params.id } });
  res.json({ message: "Resume deleted" });
});