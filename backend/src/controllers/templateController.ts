import { Request, Response } from "express";
import { asyncHandler, AppError } from "../middleware/error";
import { db } from "../config/db";
import { renderTemplate, extractTokens } from "../utils/mergeTokens";

export const listTemplates = asyncHandler(async (req: Request, res: Response) => {
  const { isActive } = req.query as { isActive?: string };
  const where: any = {};
  if (isActive !== undefined) {
    where.isActive = isActive === "true";
  }
  const templates = await db.template.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }, { createdDate: "desc" }],
    include: {
      versions: {
        orderBy: { version: "desc" },
        take: 5,
      },
    },
  });
  res.json({ data: templates });
});

export const getTemplate = asyncHandler(async (req: Request, res: Response) => {
  const template = await db.template.findUnique({
    where: { id: req.params.id },
    include: { versions: { orderBy: { version: "desc" } } },
  });
  if (!template) {
    throw new AppError("Template not found", 404);
  }
  res.json({ data: template });
});

export const createTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { templateName, subjectTemplate, bodyTemplate, version, isActive } =
    req.body as {
      templateName: string;
      subjectTemplate: string;
      bodyTemplate: string;
      version?: number;
      isActive?: boolean;
    };

  if (!templateName || !subjectTemplate || !bodyTemplate) {
    throw new AppError("Template name, subject, and body are required", 400);
  }

  const tokens = extractTokens(subjectTemplate + bodyTemplate);

  const template = await db.template.create({
    data: {
      templateName,
      subjectTemplate,
      bodyTemplate,
      version: version ?? 1,
      isActive: isActive ?? true,
    },
  });

  res.status(201).json({ data: { ...template, tokens } });
});

export const updateTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { templateName, subjectTemplate, bodyTemplate, version, isActive } =
    req.body as {
      templateName?: string;
      subjectTemplate?: string;
      bodyTemplate?: string;
      version?: number;
      isActive?: boolean;
    };

  const template = await db.template.update({
    where: { id: req.params.id },
    data: { templateName, subjectTemplate, bodyTemplate, version, isActive },
  });
  res.json({ data: template });
});

export const deleteTemplate = asyncHandler(async (req: Request, res: Response) => {
  await db.template.delete({ where: { id: req.params.id } });
  res.json({ message: "Template deleted" });
});

export const renderTemplatePreview = asyncHandler(
  async (req: Request, res: Response) => {
    const { templateId, mergeData } = req.body as {
      templateId: string;
      mergeData: Record<string, string>;
    };

    const template = await db.template.findUnique({
      where: { id: templateId },
    });
    if (!template) {
      throw new AppError("Template not found", 404);
    }

    const subject = renderTemplate(template.subjectTemplate, mergeData);
    const body = renderTemplate(template.bodyTemplate, mergeData);

    res.json({ data: { subject, body, tokens: extractTokens(template.subjectTemplate + template.bodyTemplate) } });
  }
);