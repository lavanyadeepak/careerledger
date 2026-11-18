"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteResume = exports.createResume = exports.getResume = exports.listResumes = void 0;
const error_1 = require("../middleware/error");
const db_1 = require("../config/db");
exports.listResumes = (0, error_1.asyncHandler)(async (req, res) => {
    const resumes = await db_1.db.resume.findMany({
        orderBy: [{ isDefault: "desc" }, { createdDate: "desc" }],
    });
    res.json({ data: resumes });
});
exports.getResume = (0, error_1.asyncHandler)(async (req, res) => {
    const resume = await db_1.db.resume.findUnique({
        where: { id: req.params.id },
    });
    if (!resume) {
        throw new error_1.AppError("Resume not found", 404);
    }
    res.json({ data: resume });
});
exports.createResume = (0, error_1.asyncHandler)(async (req, res) => {
    const { resumeName, version, filePath, fileSize, mimeType, isDefault } = req.body;
    if (!resumeName || !filePath) {
        throw new error_1.AppError("Resume name and file path are required", 400);
    }
    // If this is default, unset others
    if (isDefault) {
        await db_1.db.resume.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
    }
    const resume = await db_1.db.resume.create({
        data: { resumeName, version: version ?? "1.0", filePath, fileSize, mimeType, isDefault: isDefault ?? false },
    });
    res.status(201).json({ data: resume });
});
exports.deleteResume = (0, error_1.asyncHandler)(async (req, res) => {
    await db_1.db.resume.delete({ where: { id: req.params.id } });
    res.json({ message: "Resume deleted" });
});
//# sourceMappingURL=resumeController.js.map