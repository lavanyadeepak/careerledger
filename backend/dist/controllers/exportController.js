"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportCsv = exports.exportExcel = void 0;
const error_1 = require("../middleware/error");
const db_1 = require("../config/db");
const exceljs_1 = __importDefault(require("exceljs"));
const sync_1 = require("csv-stringify/sync");
exports.exportExcel = (0, error_1.asyncHandler)(async (req, res) => {
    const { company, recruiter, position, status, source, startDate, endDate } = req.query;
    const where = {};
    if (company)
        where.recruiter = { company: { contains: company, mode: "insensitive" } };
    if (recruiter) {
        where.recruiter = { ...where.recruiter, OR: [
                { name: { contains: recruiter, mode: "insensitive" } },
                { email: { contains: recruiter, mode: "insensitive" } },
            ] };
    }
    if (position)
        where.position = { contains: position, mode: "insensitive" };
    if (status)
        where.status = status;
    if (source)
        where.source = source;
    if (startDate || endDate) {
        where.appliedDate = {};
        if (startDate)
            where.appliedDate.gte = new Date(startDate);
        if (endDate)
            where.appliedDate.lte = new Date(endDate);
    }
    const applications = await db_1.db.application.findMany({
        where,
        orderBy: { appliedDate: "desc" },
        include: { recruiter: true, template: true, resume: true },
    });
    const workbook = new exceljs_1.default.Workbook();
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
    res.setHeader("Content-Disposition", 'attachment; filename="applications.xlsx"');
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    await workbook.xlsx.write(res);
    res.end();
});
exports.exportCsv = (0, error_1.asyncHandler)(async (req, res) => {
    const { company, recruiter, position, status, source, startDate, endDate } = req.query;
    const where = {};
    if (company)
        where.recruiter = { company: { contains: company, mode: "insensitive" } };
    if (recruiter) {
        where.recruiter = { ...where.recruiter, OR: [
                { name: { contains: recruiter, mode: "insensitive" } },
                { email: { contains: recruiter, mode: "insensitive" } },
            ] };
    }
    if (position)
        where.position = { contains: position, mode: "insensitive" };
    if (status)
        where.status = status;
    if (source)
        where.source = source;
    if (startDate || endDate) {
        where.appliedDate = {};
        if (startDate)
            where.appliedDate.gte = new Date(startDate);
        if (endDate)
            where.appliedDate.lte = new Date(endDate);
    }
    const applications = await db_1.db.application.findMany({
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
    const csv = (0, sync_1.stringify)([{ ...rows[0] }, ...rows], { header: true, columns: Object.keys(rows[0] || {}) }) || "";
    res.setHeader("Content-Disposition", 'attachment; filename="applications.csv"');
    res.setHeader("Content-Type", "text/csv");
    res.send(csv);
});
//# sourceMappingURL=exportController.js.map