"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderTemplatePreview = exports.deleteTemplate = exports.updateTemplate = exports.createTemplate = exports.getTemplate = exports.listTemplates = void 0;
const error_1 = require("../middleware/error");
const db_1 = require("../config/db");
const mergeTokens_1 = require("../utils/mergeTokens");
exports.listTemplates = (0, error_1.asyncHandler)(async (req, res) => {
    const { isActive } = req.query;
    const where = {};
    if (isActive !== undefined) {
        where.isActive = isActive === "true";
    }
    const templates = await db_1.db.template.findMany({
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
exports.getTemplate = (0, error_1.asyncHandler)(async (req, res) => {
    const template = await db_1.db.template.findUnique({
        where: { id: req.params.id },
        include: { versions: { orderBy: { version: "desc" } } },
    });
    if (!template) {
        throw new error_1.AppError("Template not found", 404);
    }
    res.json({ data: template });
});
exports.createTemplate = (0, error_1.asyncHandler)(async (req, res) => {
    const { templateName, subjectTemplate, bodyTemplate, version, isActive } = req.body;
    if (!templateName || !subjectTemplate || !bodyTemplate) {
        throw new error_1.AppError("Template name, subject, and body are required", 400);
    }
    const tokens = (0, mergeTokens_1.extractTokens)(subjectTemplate + bodyTemplate);
    const template = await db_1.db.template.create({
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
exports.updateTemplate = (0, error_1.asyncHandler)(async (req, res) => {
    const { templateName, subjectTemplate, bodyTemplate, version, isActive } = req.body;
    const template = await db_1.db.template.update({
        where: { id: req.params.id },
        data: { templateName, subjectTemplate, bodyTemplate, version, isActive },
    });
    res.json({ data: template });
});
exports.deleteTemplate = (0, error_1.asyncHandler)(async (req, res) => {
    await db_1.db.template.delete({ where: { id: req.params.id } });
    res.json({ message: "Template deleted" });
});
exports.renderTemplatePreview = (0, error_1.asyncHandler)(async (req, res) => {
    const { templateId, mergeData } = req.body;
    const template = await db_1.db.template.findUnique({
        where: { id: templateId },
    });
    if (!template) {
        throw new error_1.AppError("Template not found", 404);
    }
    const subject = (0, mergeTokens_1.renderTemplate)(template.subjectTemplate, mergeData);
    const body = (0, mergeTokens_1.renderTemplate)(template.bodyTemplate, mergeData);
    res.json({ data: { subject, body, tokens: (0, mergeTokens_1.extractTokens)(template.subjectTemplate + template.bodyTemplate) } });
});
//# sourceMappingURL=templateController.js.map