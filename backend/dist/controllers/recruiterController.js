"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecruiterHistory = exports.deleteRecruiter = exports.updateRecruiter = exports.createRecruiter = exports.getRecruiter = exports.listRecruiters = void 0;
const error_1 = require("../middleware/error");
const db_1 = require("../config/db");
exports.listRecruiters = (0, error_1.asyncHandler)(async (req, res) => {
    const { search, company, page = "1", limit = "20" } = req.query;
    const where = {};
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
        db_1.db.recruiter.findMany({
            where,
            orderBy: { createdDate: "desc" },
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit),
            include: {
                _count: { select: { applications: true } },
            },
        }),
        db_1.db.recruiter.count({ where }),
    ]);
    res.json({
        data: recruiters,
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
});
exports.getRecruiter = (0, error_1.asyncHandler)(async (req, res) => {
    const recruiter = await db_1.db.recruiter.findUnique({
        where: { id: req.params.id },
        include: {
            applications: {
                orderBy: { appliedDate: "desc" },
                include: { template: true, resume: true },
            },
        },
    });
    if (!recruiter) {
        throw new error_1.AppError("Recruiter not found", 404);
    }
    res.json({ data: recruiter });
});
exports.createRecruiter = (0, error_1.asyncHandler)(async (req, res) => {
    const { name, email, designation, company, linkedInUrl, phone, source, notes } = req.body;
    if (!name) {
        throw new error_1.AppError("Name is required", 400);
    }
    const recruiter = await db_1.db.recruiter.create({
        data: {
            name,
            email,
            designation,
            company,
            linkedInUrl,
            phone,
            source: source,
            notes,
        },
    });
    res.status(201).json({ data: recruiter });
});
exports.updateRecruiter = (0, error_1.asyncHandler)(async (req, res) => {
    const { name, email, designation, company, linkedInUrl, phone, source, notes } = req.body;
    const recruiter = await db_1.db.recruiter.update({
        where: { id: req.params.id },
        data: { name, email, designation, company, linkedInUrl, phone, source: source, notes },
    });
    res.json({ data: recruiter });
});
exports.deleteRecruiter = (0, error_1.asyncHandler)(async (req, res) => {
    await db_1.db.recruiter.delete({ where: { id: req.params.id } });
    res.json({ message: "Recruiter deleted" });
});
exports.getRecruiterHistory = (0, error_1.asyncHandler)(async (req, res) => {
    const applications = await db_1.db.application.findMany({
        where: { recruiterId: req.params.id },
        orderBy: { appliedDate: "desc" },
        include: { template: true, resume: true, followups: true },
    });
    res.json({ data: applications });
});
//# sourceMappingURL=recruiterController.js.map